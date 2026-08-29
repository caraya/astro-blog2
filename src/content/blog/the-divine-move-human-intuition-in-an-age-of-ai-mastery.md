---
title: "The Divine Move: Human Intuition in an Age of AI Mastery"
date: 2026-10-09
tags:
  - AI
  - Gaming
  - Philosophy
math: true
---

In 2019, Lee Sedol, the only human to ever win a professional game against DeepMind's AlphaGo, [announced his retirement from competitive Go](https://www.bbc.com/news/technology-50573071). His reason was both simple and chilling: "Even if I become the number one, there is an entity that cannot be defeated."

For a game that has been played for over 2,500 years, a game often described as an art form rather than a sport, this felt like an extinction event. But as it turns out, the game of Go was just the first domino.

The story of the last decade isn't just about a machine mastering a board game; it's about the erosion of the boundary between "calculable" problems and "human" intuition. Whether it's the folding of a protein, the drafting of a sonnet, or the architecting of a codebase, we are all facing Lee Sedol's dilemma: what is the place for humans in a world where an "entity" can objectively outperform us at an increasing number of specialized tasks?

DeepMind's systems provide one particularly clear path through this transformation, from mastering games to supporting scientific discovery and physical control, but they represent only one part of the broader development of AI.

## The fall of the champions

The journey to this point was rapid. It began in October 2015, when [AlphaGo](https://deepmind.google/research/alphago/) played Fan Hui, a professional two-dan player (2p) and three-time European champion. The result was a staggering 5-0 sweep. It was the first time an AI had beaten a human professional on a full-sized board without a handicap.

But the world truly took notice in March 2016. An improved version of AlphaGo faced Lee Sedol, a 9p legend and one of the greatest players in the history of the game. It was during Game 2 that the machine made a move that left both the commentary team and the Go world in stunned silence. [Move 37](https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol#Game_2) flew in the face of centuries of Go theory. It looked so risky and unfamiliar that the commentators initially treated it as a mistake, but AlphaGo had judged it a strategic masterstroke. It was the moment we realized that AI could do more than calculate familiar possibilities. Depending on the game, it could take a risk no human had considered and begin to expand the boundaries of what counted as a good move.

The machine won the match 4-1.

The fourth game of that match, however, became legendary for [Move 78](https://www.thewonger.com/essays/move-78), a move so unexpected and brilliant that it was dubbed "The Divine Move." It was the one moment where human intuition bypassed the machine's probability trees, causing AlphaGo to stumble. It remains the only game a human has won against AlphaGo in a professional setting.

AlphaGo didn't just beat Lee Sedol; it redefined the game. Go players had traditionally valued large margins of victory, but AlphaGo demonstrated that maximizing the chance of winning did not require maximizing the final score. A win by 1 point achieved the same result as a win by 10. It revealed the beauty of "ugly" moves that defied human aesthetics but were selected for their estimated chance of winning. It was a humbling moment for human players, but it also opened up new avenues of creativity in the game.

## Beyond human intervention: AlphaGo Zero and AlphaZero

DeepMind's systems increasingly relied less on human game data.

The original AlphaGo was trained on thousands of human amateur and professional games. It learned by mimicking us. But AlphaGo Zero represented a major shift: it was given only the rules of Go and learned through self-play. Later, [AlphaZero](https://deepmind.google/research/alphazero-and-muzero/) generalized this approach to Go, chess, and shogi.

## Beyond explicit rules: MuZero

[MuZero](https://deepmind.google/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/) took the next step. Unlike AlphaGo Zero and AlphaZero, it was not given the rules of the games it played. Instead, it learned a task-relevant model of its environment from observations, actions, and rewards. That model represented the value of a position, the best action to take, and the reward produced by the previous action. MuZero then used this learned model for lookahead planning, modeling only the parts of the environment relevant to its decisions rather than reconstructing every detail of the game. This allowed it to master Go, chess, shogi, and Atari games without an explicitly supplied ruleset.

We have moved from systems trained on human examples to systems that learn through self-play and environment interaction, at computational scales far beyond those available to an individual human.

## From games to reality: AlphaFold and scientific discovery

This shift from mastering games to tackling real-world complexity is perhaps most evident in [AlphaFold](https://www.nature.com/articles/s41586-021-03819-2). For decades, the "protein folding problem" (predicting the 3D shape of a protein from its amino acid sequence) was a monumental challenge for biology. Human researchers spent years mapping single proteins using expensive, painstaking methods.

AlphaFold substantially advanced protein-structure prediction at a scale and speed that feels almost magical. Depending on the model and hardware, it can produce predictions far faster than experimental methods, although those predictions do not replace experimental validation. While this is a triumph for science, it mirrors the "invincibility" problem Lee Sedol felt. When an AI can rapidly produce a prediction that might otherwise require extensive research, where does the human scientist fit?

The answer suggests a new role: **the navigator**. The AI can map the terrain and sometimes reveal routes no human would have drawn, but humans still decide which direction is worth exploring. AlphaFold doesn't "know" why a specific protein might cure a disease or regulate an ecosystem. It provides the dictionary; we still have to decide which stories matter.

## When AI becomes the pilot

Fusion research offers a more complicated version of the navigator role. A tokamak fusion reactor uses powerful magnetic fields to confine ionized gas, or plasma, in a doughnut-shaped chamber. Keeping that plasma stable at temperatures above 100 million degrees Celsius requires researchers to balance magnetic fields, fuel, heating, pressure, and the limits of the machine itself. Human operators cannot efficiently search every possible combination of those variables, but AI can explore them in simulation.

In its [official announcement](https://deepmind.google/blog/bringing-ai-to-the-next-generation-of-fusion-energy/), Google DeepMind describes its collaboration with Commonwealth Fusion Systems, which is also outlined in a [CFS announcement](https://blog.cfs.energy/with-ai-alliance-google-deepmind-and-cfs-take-fusion-to-the-next-level/). The partnership uses the open-source TORAX plasma simulator with reinforcement learning and evolutionary search to test millions of possible operating scenarios for the SPARC tokamak. The goal is to find efficient and robust ways to produce fusion energy, manage heat, and control the plasma in real time. This work extends earlier research in which deep reinforcement learning controlled the magnetic configuration of a tokamak plasma, as described in a [Nature study](https://www.nature.com/articles/s41586-021-04301-9).

The important detail is what "AI-controlled fusion" actually means. The AI does not decide that fusion is worth pursuing, define an acceptable safety margin, or make an imperfect simulation trustworthy. It searches a vast control space, while human researchers define the objectives and constraints, validate the results, and decide when a strategy is ready to test on physical hardware. As [one analysis of the partnership](https://dailycodesolutions.com/blog/the-real-reason-google-deepmind-is-working-with-a-fusion-energy-startup/) points out, practical control systems are likely to combine machine-learning policies with classical controllers and supervisory safety layers.

This is a useful correction to the idea that AI simply handles the "how" while humans supply the insight. In some cases, AI may discover strategies that no engineer would have designed directly. The human role is shifting toward choosing the problem, defining the boundaries, and taking responsibility for the consequences. The [World Economic Forum's overview](https://www.weforum.org/stories/energy-transition/how-ai-will-help-get-fusion-from-lab-to-grid-by-the-2030s/) places this collaboration in the larger effort to move fusion from experimental facilities toward the grid, but that destination remains a goal, not an achieved result. SPARC has not yet demonstrated commercial fusion power; the AI is helping researchers prepare for that test.

Fusion therefore gives us a more demanding definition of human judgment. Humans may no longer be the most effective at finding a path through a complicated physical search space. But we remain accountable for deciding which paths are worth taking, what risks are acceptable, and what success is supposed to mean.

## From logic to creativity: The blank page and the codebase

This tension isn't limited to games and scientific discovery. It's now central to how we write, paint, and code.

In **writing**, Large Language Models (LLMs) can generate thousands of words in seconds. They can mimic style, structure, and tone with unnerving accuracy. We are entering an era where the "average" piece of writing (the email, the status report, the generic blog post) is becoming easier to produce. But while these models are masterful at pattern matching, they provide no evidence of subjective experience or personal intention. In this essay, that gap is what we mean by **subtext and soul**.

An AI can write a sonnet about grief by drawing on patterns associated with words like "shadow," "hollow," and "tears" in its training data. Current systems provide no evidence that they have experienced loss or care about the outcome of a corporate report.

In **fiction and highly creative fields**, this gap becomes even more apparent. An AI can construct a perfectly functional plot, adhering to every beat of the "Hero's Journey." Whether it can create the *subjective truth* that makes a story resonate is less a settled technical question than a question about authorship, experience, and reader response.

This is even more evident in the explosion of **multimodal and generative art**. Tools like **Midjourney, DALL-E, and Sora** can generate breathtaking visuals and video from a single prompt. They can mimic the brushstrokes associated with Van Gogh or the cinematic lighting associated with Roger Deakins with little effort from the user. But these tools essentially generate outputs from patterns learned from large datasets rather than from personal memories or lived experience.

The "Divine Move" in art isn't just about the final image; for human artists, it's also about **communicative intent**. A painter may choose a specific color because it evokes a precise, personal memory. An AI-generated sunset is not literally an average of every sunset in its training data, but its output is shaped by patterns learned from many examples. A human painter may instead connect the image to a particular lived experience. Great fiction often works because of its **intentional imperfections**: the strange, idiosyncratic details that a creator chooses to preserve. A machine generates likely words or pixels; a human creator may reach for the most *meaningful* one, even when it is statistically unlikely.

When we read a masterwork or view a painting, we aren't just consuming a sequence of events or colors; we may be participating in a shared hallucination with another consciousness. We look for the "Divine Move" in a character's choice, a poet's metaphor, or a painter's stroke: the moment where a creator breaks the rules of logic to reveal something about the human condition. In these subjective fields, an AI's apparent "perfection" may be its greatest weakness. Current systems can mimic the form of art, but there is no established evidence that they possess the vulnerability or subjective experience associated with creating it.

When humans write, we aren't just arranging words; we are trying to bridge the gap between two human minds. We are sharing the "Divine Move" equivalent of a perspective that exists because of our specific, messy, lived experiences. A machine can simulate the bridge, but whether it can participate in the connection remains an open philosophical question. Our value as creators may be shifting from "production" to **"meaning curation"**, the ability to say something that actually matters to another person.

In **programming**, the shift is even more pronounced. Tools such as [GitHub Copilot](https://docs.github.com/en/copilot/get-started/features) and [Gemini Code Assist](https://developers.google.com/gemini-code-assist/docs/overview) provide inline suggestions and chat in supported development environments. These assistive features can propose an entire function or help a developer investigate a subtle bug, although their exact capabilities vary by product, plan, IDE, model, and configuration. We are moving away from what some call **["vibe coding"](https://en.wikipedia.org/wiki/Vibe_coding)**, the process of letting the AI drive the implementation without a deep understanding of the underlying logic, toward a more disciplined role as an architect.

If the machine handles the syntax, the human is free to focus on the *system*. Our value as programmers is shifting from knowing the exact syntax of a library to understanding the trade-offs, the security implications, and the ultimate purpose of the software we build. We are becoming the editors of logic and the designers of its boundaries. The machine can generate a thousand ways to solve a problem, and it may discover approaches that surprise us, but people still have to decide which solution is maintainable, ethical, and aligned with human needs. The "Divine Move" in programming is no longer the clever one-liner; it's the architectural decision that prioritizes human clarity over machine efficiency.

Of course, the landscape is shifting even as we write this. Beyond autocomplete and chat, some products offer [agentic features](https://docs.github.com/en/copilot/get-started/features#agentic-features), while frameworks such as [LangChain](https://docs.langchain.com/oss/python/langchain/overview) let developers build agents around a model, tools, prompts, and middleware. Depending on the tools and permissions provided, these agents may browse the web, edit files, run tests, and execute multi-step tasks. Those capabilities are not universal: availability can depend on the product, plan, IDE, organizational policy, and release status, and sensitive actions may still require human approval. These tools are changing our relationship with AI from "tool" to "collaborator," pushing us even further toward the role of an orchestrator rather than a builder. The challenge is no longer just how we use AI, but how we maintain our human intent as these agents operate with increasing independence within the boundaries we set.

## The question of fairness: AlphaStar and beyond

This evolutionary path brings us to a difficult question: should AI be allowed to compete against humans at all?

When DeepMind's [AlphaStar](https://deepmind.google/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/) reached the Grandmaster level in *StarCraft II*, it highlighted a new dimension of machine dominance. Unlike Go, *StarCraft* is a game of imperfect information and real-time execution. While AlphaStar was eventually restricted to human-like limits on its actions-per-minute (APM) and "camera" movements, it still possessed a level of precision and information processing that was difficult for a human to replicate.

This raises the question of whether competition involving machines is still a fair test of human skill. If a machine is objectively "better" overall, the competition stops being a test of excellence and starts being a test of how well we can cope with a superior entity.

## The place for humans

If Lee Sedol retired because he felt there was no hope against "invincibility," should we all feel the same?

Perhaps the error lies in treating Go, or any creative endeavor, solely as a problem to be solved. We don't stop running because cars are faster; we don't stop painting because cameras exist.

The AI can find the "optimal" move, and depending on the game, it may take risks or discover strategies that humans have never seen before. Move 37 was not valuable because it followed an established human idea; it was valuable precisely because it challenged one. But discovering a move is not the same as deciding what the game is for, what risks are acceptable, or why a result matters. AI can expand the space of possible play. Current AI provides no evidence that it feels the tension of the stones or the weight of the history behind the board.

Our place in an AI world isn't to compete with the machine's invincibility, but to celebrate the very fallibility that makes our "Divine Moves" so meaningful. We celebrate this fallibility by shifting our focus from the *result* to the *experience*.

Go has approximately $10^{170}$ possible board configurations, making it computationally infeasible to evaluate every possible continuation. AlphaGo was therefore a superhuman opponent, not a mathematically perfect one. If a "Divine Move" like Lee Sedol's Move 78 is less likely against such an opponent, then the moves we *do* make become even more precious. They aren't just calculations; they are statements of human persistence. Human fallibility isn't a bug; it's the source of our creative tension. When we play, we aren't just trying to find the mathematically best outcome; we are exploring the limits of our own understanding.

The AI has provided us with a new mirror. In seeing its power, including its ability to find paths beyond our intuition, we might finally understand that human judgment is not valuable only because it is different from machine calculation. It is valuable because our choices have consequences for a world we share. It's not about being better than the machine; it's about deciding what the machine should help us become.

## The horizon: Living with AGI

As we move from specialized systems like AlphaGo to the broader capabilities of Large Language Models, some researchers and technology companies describe the trajectory as progress toward Artificial General Intelligence (AGI). Under one common working definition, AGI would be able to perform across the broad range of intellectual tasks humans can. A [cognitive framework proposed by Google DeepMind](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/measuring-agi-cognitive-framework/) offers one guidepost for measuring that progress. It evaluates systems across 10 abilities, including learning, memory, reasoning, metacognition, problem solving, and social cognition, using held-out tasks and comparisons with representative human baselines. Its authors describe this framework as one part of a broader measurement effort, not a definitive test of AGI. No system has yet demonstrated general intelligence across this full range, so what follows is necessarily an extrapolation from the capabilities and effects of current AI.

Current AI systems already automate parts of writing, programming, analysis, and other forms of knowledge work. Evidence from [workplace deployment](https://www.nber.org/papers/w31161), [occupational-exposure analysis](https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and), and [employer surveys](https://www.weforum.org/publications/the-future-of-jobs-report-2023/) suggests that their adoption is beginning to reshape tasks and skills within jobs, increasing the emphasis in some roles on supervision, verification, judgment, and accountability. If these trends continue and systems approaching AGI emerge, the economic value assigned to some forms of human production may diminish further. This would deepen an existing tension in societies that often equate human worth with productivity.

If future systems can optimize supply chains, support medical diagnosis, and help manage energy grids with superhuman efficiency, we may be forced to answer a question we've avoided for centuries: What is a human for when they are no longer "useful" in the traditional sense? Fusion suggests that human usefulness would not disappear overnight, but could shift from executing plans to choosing goals, defining constraints, and taking responsibility for consequences.

The answer might lie in a return to **intrinsic value**. We create, we play, and we connect not only to achieve a result, but because the act itself can be the point. A future AGI might generate a painting or simulate a conversation, but whether it could *want* to paint or *desire* to be understood would remain an open question about machine consciousness.

Machines already handle parts of the "how" by searching large possibility spaces and optimizing defined objectives more efficiently than humans can. If future systems assume more of that work, people may increasingly be responsible for choosing the goals, defining acceptable constraints, and deciding whether an optimized outcome is worth its consequences. Our future with AGI, if it emerges, would therefore be less about competing for territory in logic and production than about retaining responsibility for meaning and consequences.

Lee Sedol's retirement wasn't the end of Go; it was the beginning of a new era where we play the game not to be the best in the universe, but to be the most human version of ourselves. That, ultimately, is a move no current machine has shown it can make.

## References

AlphaStar Team. (2019, October 30). *AlphaStar: Grandmaster level in StarCraft II using multi-agent reinforcement learning*. Google DeepMind. https://deepmind.google/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/

BBC News. (2019, November 27). *Go master quits because AI 'cannot be defeated'*. https://www.bbc.com/news/technology-50573071

Brynjolfsson, E., Li, D., & Raymond, L. R. (2023). *Generative AI at work* (Working Paper No. 31161). National Bureau of Economic Research. https://www.nber.org/papers/w31161

Burnell, R., & Kelly, O. (2026, March 17). *Measuring progress toward AGI: A cognitive framework*. Google. https://blog.google/innovation-and-ai/models-and-research/google-deepmind/measuring-agi-cognitive-framework/

Davis, D. (2025, October 17). *Why Google DeepMind is partnering with CFS on fusion reactor control*. Daily Code Solutions. https://dailycodesolutions.com/blog/the-real-reason-google-deepmind-is-working-with-a-fusion-energy-startup/

Degrave, J., Felici, F., Buchli, J., Neunert, M., Tracey, B., Carpanese, F., Ewalds, T., Hafner, R., Abdolmaleki, A., de Las Casas, D., Donner, C., Fritz, L., Galperti, C., Huber, A., Keeling, J., Tsimpoukelli, M., Kay, J., Merle, A., Moret, J.-M., ... Riedmiller, M. (2022). Magnetic control of tokamak plasmas through deep reinforcement learning. *Nature, 602*, 414-419. https://doi.org/10.1038/s41586-021-04301-9

Deshpande, J. (2025, October 16). *With AI alliance, Google DeepMind and CFS take fusion to the next level*. Commonwealth Fusion Systems. https://blog.cfs.energy/with-ai-alliance-google-deepmind-and-cfs-take-fusion-to-the-next-level/

GitHub. (n.d.). *GitHub Copilot features*. Retrieved August 29, 2026, from https://docs.github.com/en/copilot/get-started/features

Gmyrek, P., Berg, J., & Bescond, D. (2023). *Generative AI and jobs: A global analysis of potential effects on job quantity and quality* (ILO Working Paper No. 96). International Labour Organization. https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and

Google. (2026, August 19). *Gemini Code Assist overview*. Google for Developers. https://developers.google.com/gemini-code-assist/docs/overview

Google DeepMind. (n.d.-a). *AlphaGo*. https://deepmind.google/research/alphago/

Google DeepMind. (n.d.-b). *AlphaZero and MuZero*. https://deepmind.google/research/alphazero-and-muzero/

Google DeepMind Fusion Team. (2025, October 16). *Bringing AI to the next generation of fusion energy*. Google DeepMind. https://deepmind.google/blog/bringing-ai-to-the-next-generation-of-fusion-energy/

JJW. (n.d.). *Move 78*. https://www.thewonger.com/essays/move-78

Jumper, J., Evans, R., Pritzel, A., Green, T., Figurnov, M., Ronneberger, O., Tunyasuvunakool, K., Bates, R., Zidek, A., Potapenko, A., Bridgland, A., Meyer, C., Kohl, S. A. A., Ballard, A. J., Cowie, A., Romera-Paredes, B., Nikolov, S., Jain, R., Adler, J., ... Hassabis, D. (2021). Highly accurate protein structure prediction with AlphaFold. *Nature, 596*, 583-589. https://doi.org/10.1038/s41586-021-03819-2

LangChain. (n.d.). *LangChain overview*. Retrieved August 29, 2026, from https://docs.langchain.com/oss/python/langchain/overview

Schenker, J. (2025, December 12). *How AI will help get fusion from lab to grid by the 2030s*. World Economic Forum. https://www.weforum.org/stories/energy-transition/how-ai-will-help-get-fusion-from-lab-to-grid-by-the-2030s/

Schrittwieser, J., Antonoglou, I., Hubert, T., Simonyan, K., Sifre, L., Schmitt, S., Guez, A., Lockhart, E., Hassabis, D., Graepel, T., Lillicrap, T., & Silver, D. (2020, December 23). *MuZero: Mastering Go, chess, shogi and Atari without rules*. Google DeepMind. https://deepmind.google/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/

Wikipedia contributors. (n.d.). AlphaGo versus Lee Sedol. In *Wikipedia*. Retrieved August 29, 2026, from https://en.wikipedia.org/wiki/AlphaGo_versus_Lee_Sedol#Game_2

Wikipedia contributors. (n.d.). Vibe coding. In *Wikipedia*. Retrieved August 29, 2026, from https://en.wikipedia.org/wiki/Vibe_coding

World Economic Forum. (2023). *The future of jobs report 2023*. https://www.weforum.org/publications/the-future-of-jobs-report-2023/
