import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChallengeResult {
  challenge_id: string;
  winner_id: string;
  loser_id: string | null;
  is_draw: boolean;
  challenger_score: number;
  opponent_score: number;
  screenshot_url: string;
  notes: string;
  reported_by: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // GET /challenges - List user's challenges
    if (req.method === "GET" && path.endsWith("/challenges")) {
      const { data: challenges, error } = await supabase
        .from("challenges")
        .select(`
          *,
          game:games(*),
          challenger:profiles!challenger_id(*),
          opponent:profiles!opponent_id(*)
        `)
        .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(challenges), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /challenges - Create challenge
    if (req.method === "POST" && path.endsWith("/challenges")) {
      const body = await req.json();
      const { opponent_id, game_id, platform, credits_amount, rules } = body;

      // Check user has enough credits
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wallet || wallet.balance < credits_amount) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: challenge, error } = await supabase
        .from("challenges")
        .insert({
          challenger_id: user.id,
          opponent_id,
          game_id,
          platform,
          credits_amount,
          rules: rules || {},
        })
        .select()
        .maybeSingle();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create notification for opponent
      await supabase.from("notifications").insert({
        user_id: opponent_id,
        type: "challenge",
        title: "New Challenge!",
        message: `You have been challenged to a match for ${credits_amount} credits.`,
        data: { challenge_id: challenge.id },
      });

      return new Response(JSON.stringify(challenge), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /challenges/:id/accept - Accept challenge
    if (req.method === "PUT" && path.includes("/accept")) {
      const challengeId = path.split("/")[2];

      const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .maybeSingle();

      if (!challenge || challenge.opponent_id !== user.id) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check opponent has enough credits
      const { data: opponentWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!opponentWallet || opponentWallet.balance < challenge.credits_amount) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("challenges")
        .update({ status: "accepted" })
        .eq("id", challengeId);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Notify challenger
      await supabase.from("notifications").insert({
        user_id: challenge.challenger_id,
        type: "challenge",
        title: "Challenge Accepted!",
        message: `Your challenge has been accepted. The match is now active!`,
        data: { challenge_id: challengeId },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /challenges/:id/decline - Decline challenge
    if (req.method === "PUT" && path.includes("/decline")) {
      const challengeId = path.split("/")[2];

      const { error } = await supabase
        .from("challenges")
        .update({ status: "declined" })
        .eq("id", challengeId)
        .eq("opponent_id", user.id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /challenges/:id/result - Submit result
    if (req.method === "POST" && path.includes("/result")) {
      const challengeId = path.split("/")[2];
      const body: ChallengeResult = await req.json();

      const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .maybeSingle();

      if (!challenge) {
        return new Response(JSON.stringify({ error: "Challenge not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (challenge.status !== "accepted" && challenge.status !== "in_progress") {
        return new Response(JSON.stringify({ error: "Challenge not active" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert result
      const { error: resultError } = await supabase
        .from("challenge_results")
        .insert({
          challenge_id: challengeId,
          winner_id: body.winner_id,
          loser_id: body.loser_id,
          is_draw: body.is_draw,
          challenger_score: body.challenger_score,
          opponent_score: body.opponent_score,
          screenshot_url: body.screenshot_url,
          notes: body.notes,
          reported_by: user.id,
        });

      if (resultError) {
        return new Response(JSON.stringify({ error: resultError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update challenge status
      await supabase
        .from("challenges")
        .update({ status: "completed" })
        .eq("id", challengeId);

      // Transfer credits if not a draw
      if (!body.is_draw && body.winner_id) {
        const loserId = body.winner_id === challenge.challenger_id
          ? challenge.opponent_id
          : challenge.challenger_id;

        // Get winner wallet
        const { data: winnerWallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", body.winner_id)
          .maybeSingle();

        // Get loser wallet
        const { data: loserWallet } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", loserId)
          .maybeSingle();

        if (winnerWallet && loserWallet) {
          const creditAmount = challenge.credits_amount;

          // Update winner balance
          await supabase
            .from("wallets")
            .update({
              balance: winnerWallet.balance + creditAmount,
              total_earned: winnerWallet.total_earned + creditAmount
            })
            .eq("user_id", body.winner_id);

          // Record winner transaction
          await supabase
            .from("transactions")
            .insert({
              wallet_id: winnerWallet.id,
              user_id: body.winner_id,
              type: "challenge_win",
              amount: creditAmount,
              balance_before: winnerWallet.balance,
              balance_after: winnerWallet.balance + creditAmount,
              challenge_id: challengeId,
              description: "Challenge win",
            });

          // Update loser balance
          await supabase
            .from("wallets")
            .update({
              balance: Math.max(0, loserWallet.balance - creditAmount),
              total_spent: loserWallet.total_spent + creditAmount
            })
            .eq("user_id", loserId);

          // Record loser transaction
          await supabase
            .from("transactions")
            .insert({
              wallet_id: loserWallet.id,
              user_id: loserId,
              type: "challenge_loss",
              amount: -creditAmount,
              balance_before: loserWallet.balance,
              balance_after: Math.max(0, loserWallet.balance - creditAmount),
              challenge_id: challengeId,
              description: "Challenge loss",
            });
        }

        // Update rankings
        await updateRankings(supabase, body.winner_id, loserId, challenge.game_id);
      }

      // Notify both players
      await supabase.from("notifications").insert([
        {
          user_id: challenge.challenger_id,
          type: "result",
          title: "Match Complete!",
          message: `The match has been recorded. ${body.is_draw ? "It was a draw!" : ""}`,
          data: { challenge_id: challengeId },
        },
        {
          user_id: challenge.opponent_id,
          type: "result",
          title: "Match Complete!",
          message: `The match has been recorded. ${body.is_draw ? "It was a draw!" : ""}`,
          data: { challenge_id: challengeId },
        },
      ]);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function updateRankings(
  supabase: ReturnType<typeof createClient>,
  winnerId: string,
  loserId: string,
  gameId: string
) {
  // Update winner ranking
  const { data: winnerRank } = await supabase
    .from("rankings")
    .select("*")
    .eq("user_id", winnerId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (winnerRank) {
    const newStreak = (winnerRank.win_streak || 0) + 1;
    await supabase
      .from("rankings")
      .update({
        wins: (winnerRank.wins || 0) + 1,
        win_streak: newStreak,
        max_streak: Math.max(winnerRank.max_streak || 0, newStreak),
        points: (winnerRank.points || 0) + 25,
      })
      .eq("id", winnerRank.id);
  } else {
    await supabase.from("rankings").insert({
      user_id: winnerId,
      game_id: gameId,
      wins: 1,
      win_streak: 1,
      max_streak: 1,
      points: 25,
    });
  }

  // Update loser ranking
  const { data: loserRank } = await supabase
    .from("rankings")
    .select("*")
    .eq("user_id", loserId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (loserRank) {
    await supabase
      .from("rankings")
      .update({
        losses: (loserRank.losses || 0) + 1,
        win_streak: 0,
        points: Math.max(0, (loserRank.points || 0) - 10),
      })
      .eq("id", loserRank.id);
  } else {
    await supabase.from("rankings").insert({
      user_id: loserId,
      game_id: gameId,
      losses: 1,
      points: 0,
    });
  }
}
