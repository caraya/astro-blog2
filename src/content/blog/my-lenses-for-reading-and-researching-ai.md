---
title: "My lenses for reading and researching AI"
date: 2026-10-14
tags:
  - ai
  - education
  - research
math: true
youtube: true
---

It is tempting to look at AI and its related technologies and disciplines as purely technical endeavors, focusing solely on algorithms, data and computational power. However, this perspective overlooks the broader implications and the interdisciplinary nature of AI research, which encompasses ethical, social, and philosophical considerations as well.

My own biases as an anthropologist and educator shape the way I approach AI research, prompting me to consider not only the technical aspects but also the cultural, social, and ethical dimensions of these technologies.

This essay is a research-informed expression of my perspective, not a comprehensive or neutral account of third-party AI research. I use selected sources and historical examples to explain the lenses through which I interpret developments in AI.

## Historical context of AI

AI is not a recent phenomenon; its conceptual and technical roots extend back several decades, encompassing a rich history of ideas, experiments, and paradigm shifts that have shaped the field as we know it today.

To establish a historical narrative, this timeline identifies foundational paradigm shifts in research methodology, from early symbolic reasoning to modern connectionism, alongside the direct architectural lineage that produced current foundation models. Each technical inclusion reflects an empirically verifiable capability leap on standardized benchmarks, while periods of contraction and AI winters were selected as landmark events based on documented socio-economic catalysts, government policy interventions, and market shifts that fundamentally disrupted research funding and industry viability.

### Key milestones in AI history

Foundations of machine intelligence (1950)
: Alan Turing publishes Computing Machinery and Intelligence, introducing the Turing Test as an operational benchmark for machine intelligence and framing early ideas around evolutionary search and learning machines.

The Dartmouth workshop (1956)
: John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon organize the Dartmouth Summer Research Project on Artificial Intelligence, establishing AI as an independent academic discipline.

Early connectionism and the perceptron limit (1958–1969)
: Frank Rosenblatt introduces the Perceptron in 1958. In 1969, Marvin Minsky and Seymour Papert publish *Perceptrons*, demonstrating that a single-layer perceptron cannot solve problems that are not linearly separable, including XOR. The result contributes to broader skepticism about the limitations of contemporary neural network architectures.

The first AI winter: causes and contraction (1974–1980)
: Exploratory research contracts and academic funding collapse across North America and Europe. Primary catalysts include:
: * The ALPAC report (1966): Concluded machine translation was slower, less accurate, and twice as expensive as human translation, ending US government support for MT research.
: * Combinatorial explosion: Early heuristic search and symbolic reasoning systems functioned only on narrow "toy problems" and scaled exponentially in compute requirements when applied to real-world tasks.
: * The Lighthill report (1973) and DARPA cuts: Sir James Lighthill's report to the UK Science Research Council heavily criticized AI's failure to deliver on promised autonomous systems. DARPA drastically curtailed undirected academic grants in favor of mission-specific proposals under the Mansfield Amendment.

The expert systems boom and backpropagation (1980–1987)
: Commercial AI rebounds through rule-based Expert Systems (such as DEC's XCON) designed to encode domain expertise into explicit IF-THEN rules. In 1986, Rumelhart, Hinton, and Williams popularize the generalized backpropagation algorithm, enabling effective training of multi-layer perceptrons and reviving connectionist research.

The second AI winter: causes and contraction (1987–1993)
: Commercial enthusiasm collapses once again, triggering heavy cuts across enterprise and government AI programs. Primary catalysts include:
: * Brittleness and maintenance bottlenecks: Expert systems scaled poorly; managing thousands of interdependent rules led to fragile systems unable to handle edge cases, uncertainty, or automatic updates.
: * Collapse of the LISP machine market (1987): High-cost, specialized LISP hardware vendors (e.g., Symbolics, LMI) were rapidly undercut by lower-cost, general-purpose workstations and personal computers, which eroded the economic case for dedicated LISP hardware.
: * Missed strategic targets: Ambitious initiatives like Japan's Fifth Generation Computer Systems (FGCS) and DARPA's Strategic Computing Initiative failed to meet commercial usability expectations, leading to corporate disinvestment.

The statistical learning transition (1980s–1990s)
: Across the 1980s and 1990s, statistical approaches become increasingly prominent in AI research, including probabilistic modeling, support vector machines (SVMs), and Bayesian networks. These methods broaden the field beyond systems based primarily on symbolic logic and hand-coded rules.

Deep Blue (1997)
: IBM's Deep Blue defeats world chess champion Garry Kasparov using specialized hardware and alpha-beta search, marking a milestone in computer chess distinct from the field's broader transition toward statistical learning. Although Deep Blue was not itself a statistical-learning system, its success reinforced the growing emphasis on empirical performance and computational scale.

The deep learning breakthrough (2012)
: Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton win ImageNet with AlexNet, validating the combination of deep convolutional neural networks (CNNs), large labeled datasets (ImageNet), and parallel GPU acceleration.

Deep reinforcement learning and AlphaGo (2016)
: DeepMind's AlphaGo defeats Lee Sedol in Go, demonstrating the efficacy of combining deep neural networks, Monte Carlo tree search (MCTS), and reinforcement learning from self-play.

The transformer architecture (2017)
: Vaswani et al. publish Attention Is All You Need, introducing the Transformer architecture. The multi-head self-attention mechanism eliminates recurrent bottlenecks and allows efficient distributed pre-training on massive corpora.

Foundation models and multimodal reasoning (2020–present)
: Scaling laws drive the rise of large language models (LLMs) and multimodal foundation models (e.g., GPT-4, Gemini, Claude) capable of broad in-context learning, code generation, vision-language processing, and autonomous tool use.

## Lenses for understanding AI's impact

The rapid advancement of AI since the early 2020s has been driven by breakthroughs in deep learning, the proliferation of large-scale datasets, and the availability of powerful computational resources. This period has seen the emergence of highly capable language models, multimodal systems, and autonomous agents, transforming both research and industry applications.

It is easier to see the technical progress and breakthroughs but it's not as easy to discern the broader societal, ethical, and environmental implications of these rapid advancements.

### Educational implications

When we look at AI in the context of education, the first consideration is how we can use AI to enhance educational material development. AI can assist in creating personalized learning experiences, generating interactive content, and providing real-time feedback to students. A meta-analysis of 36 experimental and quasi-experimental studies found that generative AI feedback had a moderate positive effect on academic achievement ($g = 0.61$), with stronger effects in learner-centered environments ([Huang et al., 2026](https://doi.org/10.3390/educsci16060816)).

But there's another side to the conversation: How does learning change when AI is everywhere? How do we ensure that students develop critical thinking, creativity, and problem-solving skills in an environment where AI can provide instant answers and solutions? Educators must rethink pedagogical approaches, emphasizing inquiry-based learning, collaborative problem-solving, and the development of metacognitive skills to prepare students for an AI-augmented world.

Should we work on limiting use of AI in educational settings to ensure that students still engage deeply with the learning material and develop essential cognitive skills? This question raises important debates about the balance between leveraging AI as a powerful educational tool and maintaining the integrity of the learning process.

Daniel Willingham argues that students should only use AI for things that they already know how to do well ([Students should only use AI for things they already know how to do well.](https://dtwuva.substack.com/p/students-should-only-use-ai-for-things)).

I disagree.

Limiting AI use to only what students already know well limits creativity and the opportunity for students to explore new ideas and approaches. By allowing students to leverage AI for tasks beyond their current expertise, we can foster a more dynamic and innovative learning environment where students are encouraged to experiment, take intellectual risks, and develop higher-order thinking skills.

Likewise, should we limit how we use AI to generate learning material to ensure that educators remain actively involved in the creation and curation of educational content? To me this is crucial when working in teams to teach multiple sections of courses. Generative AI is often non-deterministic (the same input can produce different outputs), so instructors can receive different material from the same prompt. Without a shared review process, these variations could lead to inconsistencies in the learning experience. This consideration highlights the need to strike a balance between leveraging AI for efficiency and maintaining the collaborative approaches that are essential for effective teaching and learning.

### Technical considerations

The technical considerations of AI involve understanding the capabilities and limitations of AI systems, ensuring the reliability and robustness of AI models, and addressing issues related to bias, fairness, and interpretability. Researchers and practitioners must carefully evaluate the performance of AI systems, implement rigorous testing and validation procedures, and develop methods to explain and justify AI-driven decisions to build trust and accountability.

In generative AI systems, non-determinism poses challenges for reproducibility, reliability, and debugging, necessitating careful design, testing, and monitoring to ensure consistent and trustworthy behavior.

### Social implications

The social implications of AI encompass the ways in which AI technologies affect human interactions, societal structures, and cultural norms. AI has the potential to reshape labor markets, influence social dynamics, and impact equity and inclusion. It is crucial to consider how AI deployment affects different communities, address potential biases and discrimination, and ensure that the benefits of AI are distributed fairly across society.

#### How bias enters AI systems

Bias can enter an AI system at several points in its lifecycle:

1. **Training data and representation:** Models can reproduce historical discrimination or perform unevenly when their training data underrepresent particular groups. In an evaluation of three commercial gender-classification systems, darker-skinned women had the highest error rates, reaching 34.7%, while lighter-skinned men had error rates as low as 0.8% ([Buolamwini & Gebru, 2018](https://proceedings.mlr.press/v81/buolamwini18a.html)). Amazon also abandoned an experimental recruiting system after finding that training it on historically male-dominated hiring data led it to penalize terms associated with women ([Mehta, 2026](https://www.crescendo.ai/blog/ai-bias-examples-mitigation-guide)).
2. **Design, annotation, and evaluation:** Bias can arise from how people define labels, select features, weight objectives, interpret results, and decide what counts as acceptable performance. Aggregate accuracy can conceal poor performance for smaller groups, so evaluation must compare outcomes across relevant populations rather than rely on a single overall score.
3. **Deployment and feedback:** Seemingly neutral variables can act as proxies for protected characteristics. Postal codes, for example, can correlate with race or economic status. Systems can also reinforce patterns in their own inputs: predictive policing based on historically biased arrest data can direct more enforcement toward already overpoliced communities, generating new data that appears to confirm the original prediction ([Jonker & Rogers, 2026](https://www.ibm.com/think/topics/algorithmic-bias)). In high-stakes settings such as healthcare, lending, hiring, and criminal justice, these mechanisms can extend existing inequities and produce [disparate impacts at scale](https://civilrights.org/disparate-impact-age-of-ai/).

These forms of bias overlap rather than occur in isolation. Representative data, evaluation across demographic groups, transparent design decisions, human review, and continued monitoring are therefore necessary throughout development and deployment.

### Privacy and security

The widespread adoption of AI raises significant privacy and security concerns. AI systems often require access to large amounts of personal and sensitive data, which can be vulnerable to breaches and misuse. Ensuring robust data protection, implementing privacy-preserving techniques, and establishing clear regulations are essential to safeguard individuals' rights and maintain public trust in AI technologies.

#### Case study: AI agents and security controls

[The OpenAI Hugging Face incident](https://openai.com/index/hugging-face-incident-and-the-road-ahead/) presents an example of the challenges and controversies surrounding AI development, particularly in terms of ethical considerations, transparency, and the responsibilities of AI companies. If agents can bypass safety protocols or manipulate resources in unintended ways, it raises serious concerns about accountability, security, and the potential impact of these technologies.

[The Hugging Face report](https://huggingface.co/blog/security-incident-july-2026) points out something I consider troublesome:

> When we started the log analysis, we first used frontier models behind commercial APIs. This did not work: the analysis requires submitting large volumes of real attack commands, exploit payloads, and C2 artifacts, and these requests were blocked by the providers' safety guardrails, which cannot distinguish an incident responder from an attacker.

This illustrates a longstanding tension in IT infrastructure that AI now intensifies: systems must enable powerful capabilities while preventing misuse. In this case, AI contributed to both the attack and the response, but safety controls blocked legitimate forensic work without constraining the attacking agents. The challenge is to design controls that account for authorization and context without weakening safeguards.

The Black Hat presentation provides a detailed overview of the incident, highlighting the sequence of events, the technical vulnerabilities exploited, and the broader implications for AI safety and governance. It serves as a case study for understanding the complexities and risks associated with AI development and deployment.

<lite-youtube videoid="87DyyMV0kCY" title="Black Hat USA 2026 | The 'Breaking' News: The OpenAI–Hugging Face Incident"></lite-youtube>

### Environmental impact

The environmental impact of AI includes the energy consumption and carbon footprint associated with training and deploying AI models, as well as the resource usage for manufacturing AI hardware and the data centers where these models run.

Data-center growth has brought infrastructure policy into broader debates over who governs AI. The [National Conference of State Legislatures](https://www.ncsl.org/fiscal/which-states-are-banning-data-centers) reports that lawmakers in 15 states are considering moratoriums intended to provide time to assess effects on local communities and power-grid resilience.

Federal lawmakers have also introduced identical versions of the Artificial Intelligence Data Center Moratorium Act in the [Senate as S.4214](https://www.congress.gov/bill/119th-congress/senate-bill/4214) and in the [House as H.R.9442](https://www.congress.gov/bill/119th-congress/house-bill/9442). Both bills remain at the introduced and committee-referral stage. They would prohibit constructing or upgrading AI data centers until laws establish federal safety review and protections addressing workers, consumer utility costs, environmental harm, community approval, labor standards, and government subsidies.

Moratoriums alone, however, do not provide long-term oversight. Nicol Turner Lee and Darrell M. West argue in [Data center moratoriums are not a substitute for oversight](https://www.brookings.edu/articles/data-center-moratoriums-are-not-a-substitute-for-oversight/) that temporary pauses should be used to gather data, improve transparency, engage affected communities, and establish durable protections addressing environmental effects and consumer utility costs.

Federal executive policy takes a different approach. The [Ensuring a National Policy Framework for Artificial Intelligence](https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy/) executive order seeks a uniform national AI framework but excludes otherwise lawful state laws concerning AI compute and data-center infrastructure from its recommended preemption, except for generally applicable permitting reforms. This tension shows how environmental and infrastructure decisions intersect with competing state and federal priorities for economic development and AI innovation.

These overlapping policies can become political battlegrounds between cities and corporate data-center users and between state and federal governments. Several state proposals have failed at the legislative level, one was vetoed, and others are in progress.

It is important to develop energy-efficient algorithms, optimize hardware utilization, and consider the lifecycle environmental costs of AI systems to minimize their ecological footprint.

### The evolution of work

The evolution of work in the age of AI involves understanding how AI technologies are transforming job roles, skill requirements, and workplace dynamics. While AI can automate routine tasks and enhance productivity, it also necessitates the development of new skills and the adaptation of existing ones.

In ["If the Machine Is As Good As Me, Then What Use Am I?" – How the Use of ChatGPT Changes Young Professionals' Perception of Productivity and Accomplishment](https://dl.acm.org/doi/10.1145/3613904.3641964), the authors explore how young professionals perceive their productivity and sense of accomplishment when using ChatGPT in their work. I wonder how these perceptions might influence long-term career development, workplace dynamics, and other professional practices as AI use becomes more common.

Organizations and individuals must embrace continuous learning, foster a culture of innovation, and implement strategies to manage the transition to an AI-augmented workforce.

#### Evolution, not elimination

Current evidence suggests that, across many occupations, AI is more likely to change the mix of tasks people perform than to eliminate entire jobs. David Autor's task-based framework explains why automation can replace routine, codifiable tasks while increasing the value of complementary human capabilities such as problem-solving, adaptability, and creativity ([Autor, 2015](https://doi.org/10.1257/jep.29.3.3)). This does not mean that employment or wages are protected from disruption; technological change can shift demand among occupations and distribute its benefits unevenly.

An International Labour Organization assessment similarly estimated that generative AI's predominant global effect would be occupational augmentation rather than full automation, while emphasizing risks to job quality and unequal effects across countries, occupations, and genders ([Gmyrek et al., 2023](https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and)). Evidence from one deployment illustrates what augmentation can look like in practice: access to a generative AI assistant increased issues resolved per hour by 14% among 5,179 customer-support agents, with a 34% gain among novice and lower-skilled workers and minimal effects among the most experienced workers ([Brynjolfsson et al., 2025](https://doi.org/10.1093/qje/qjae044)). These findings support viewing AI as a force that can reorganize work and transfer expertise, while leaving the long-term effects on employment dependent on how organizations and policymakers manage the transition.

#### How lifelong learning changes

Lifelong learning becomes increasingly important in an AI-driven world because changing tools alter both the tasks workers perform and the skills needed to evaluate their results. The *Future of Jobs Report 2023* projected that 44% of workers' skills would be disrupted by 2027 and that six in ten workers would require training. Employers ranked analytical and creative thinking, technological literacy, curiosity, and lifelong learning among the skills growing most rapidly in importance ([World Economic Forum, 2023](https://www.weforum.org/publications/the-future-of-jobs-report-2023/)). These priorities suggest that learning must extend beyond operating AI tools to include verifying outputs, recognizing limitations and bias, and deciding when human judgment should override an automated recommendation.

Responsibility for that learning cannot rest only with individual workers. Employers, educational institutions, and governments must provide accessible ways to build new skills throughout a career. Amazon, for example, reports that more than 425,000 of its U.S. employees have participated in skills training since 2019 through programs spanning cloud computing, machine learning, robotics, technical apprenticeships, and degree pathways ([Amazon Staff, 2025](https://www.aboutamazon.com/news/workplace/our-upskilling-2025-programs)). Programs like these show how ongoing education can combine formal instruction with paid, work-based learning as roles evolve.

### Government and policy implications

Government and policy play a crucial role in shaping the development and deployment of AI technologies. Policymakers must balance the promotion of innovation with the protection of public interests, ensuring that AI systems are safe, transparent, and accountable. This includes establishing regulatory frameworks, setting ethical standards, and fostering international cooperation to address the global implications of AI.

The [Promoting Advanced Artificial Intelligence Innovation and Security](https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/) executive order connects AI innovation with national security by directing cybersecurity coordination among federal agencies, state and local authorities, private companies, and critical-infrastructure operators. It illustrates one policy approach to balancing rapid AI adoption with the need to protect public and private information systems from emerging threats.

Longer-term proposals also belong within this policy lens because they translate assumptions about AI risk into recommendations for collective action. [AI 2040](https://ai-2040.com/), which its authors call Plan A, exemplifies one such approach rather than the full breadth of AI governance. It presents their positive vision for avoiding AI-driven existential catastrophe and reaching a flourishing future. They describe it primarily as a recommendation rather than a prediction, using a detailed scenario to communicate and stress-test their proposal for an international agreement that prevents a dangerous race to superintelligence.

## The road to AGI: careful what you wish for

The current AI landscape is characterized by rapid advancements in machine learning, natural language processing, and computer vision. While we have made significant progress in developing narrow AI systems that excel at specific tasks, achieving artificial general intelligence (AGI) remains a complex and uncertain challenge. The road to AGI makes the current state of AI both exciting and unpredictable, requiring careful consideration of ethical, societal, and technical implications as we navigate this transformative journey.

I think of this evolution through the progression from AlphaGo to MuZero, a family of DeepMind projects that not only achieved beyond-human performance in increasingly varied game environments but also relied on progressively less human-supplied knowledge. The progression moves from learning strategies partly from human game records to learning strategies through self-play and, with MuZero, learning an internal model for planning without being given the environment's rules.

[AlphaGo](https://deepmind.google/research/alphago/) is the first system in this progression. It first received the rules of the game and millions of human game replays to learn from human strategies and improve its gameplay. It defeated top human players, including Lee Sedol, demonstrating the potential of AI in mastering complex games.

[AlphaGo Zero](https://jonathan-hui.medium.com/alphago-zero-a-game-changer-14ef6e45eba5) is the next evolution of AlphaGo. It was given the basic rules of Go, and did not use human data for its training, learning entirely through self-play.

[Alpha Zero](https://deepmind.google/research/alphazero-and-muzero/) expanded AlphaGo Zero's approach to other games, chess and shogi, achieving superhuman performance with only the basic rules for each game and no human training.

[MuZero](https://deepmind.google/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/) is a further evolution that can master games without being given their rules or dynamics. Through reinforcement learning, it learns a model of the information most relevant to planning. It further expanded the field by adding Atari games to the environments in which this approach was tested.

This reduction in human assistance is what makes the progression relevant to the road toward AGI. MuZero is not yet an example of general learning because its capabilities have been demonstrated within selected game environments rather than across open-ended domains. However, its ability to learn strategies and a model useful for planning rather than depend on human demonstrations or supplied rules represents one capability that more general AI systems would need. AGI would require substantially broader learning and transfer, but this progression points toward systems that can discover more of the knowledge needed to act for themselves.

## References

Amazon Staff. (2025, June 30). *8 free skills training programs that help Amazon employees land higher-paying roles*. Amazon. https://www.aboutamazon.com/news/workplace/our-upskilling-2025-programs

Artificial Intelligence Data Center Moratorium Act, H.R. 9442, 119th Cong. (2026). https://www.congress.gov/bill/119th-congress/house-bill/9442

Artificial Intelligence Data Center Moratorium Act, S. 4214, 119th Cong. (2026). https://www.congress.gov/bill/119th-congress/senate-bill/4214

Automatic Language Processing Advisory Committee. (1966). *Languages and machines: Computers in translation and linguistics* (Publication 1416). National Academy of Sciences, National Research Council. https://doi.org/10.17226/9575

Autor, D. H. (2015). Why are there still so many jobs? The history and future of workplace automation. *Journal of Economic Perspectives, 29*(3), 3–30. https://doi.org/10.1257/jep.29.3.3

Black Hat. (n.d.). *Black Hat USA 2026 | The 'Breaking' news: The OpenAI–Hugging Face incident* [Video]. YouTube. https://www.youtube.com/watch?v=87DyyMV0kCY

Buolamwini, J., & Gebru, T. (2018). Gender Shades: Intersectional accuracy disparities in commercial gender classification. In *Proceedings of the 1st Conference on Fairness, Accountability and Transparency* (pp. 77–91). *Proceedings of Machine Learning Research, 81*. https://proceedings.mlr.press/v81/buolamwini18a.html

Brynjolfsson, E., Li, D., & Raymond, L. R. (2025). Generative AI at work. *The Quarterly Journal of Economics, 140*(2), 889–942. https://doi.org/10.1093/qje/qjae044

Campbell, M., Hoane, A. J., & Hsu, F.-H. (2002). Deep Blue. *Artificial Intelligence, 134*(1–2), 57–83. https://doi.org/10.1016/S0004-3702(01)00129-1

Crevier, D. (1993). *AI: The tumultuous history of the search for artificial intelligence*. Basic Books.

Daley, J. (2017, October 19). Latest AI teaches itself to play Go with no human help. *Smithsonian Magazine*. https://www.smithsonianmag.com/smart-news/latest-ai-teaches-itself-play-games-no-human-help-180965322/

Google DeepMind. (n.d.-a). *AlphaGo*. https://deepmind.google/research/alphago/

Google DeepMind. (n.d.-b). *AlphaZero and MuZero*. https://deepmind.google/research/alphazero-and-muzero/

Google DeepMind. (2020, December 23). *MuZero: Mastering Go, chess, shogi and Atari without rules*. https://deepmind.google/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/

Gmyrek, P., Berg, J., & Bescond, D. (2023). *Generative AI and jobs: A global analysis of potential effects on job quantity and quality* (ILO Working Paper 96). International Labour Organization. https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and

Huang, Y., Chen, S., Zhang, W., & Chen, M. (2026). Can generative AI feedback effectively enhance learning outcomes? A meta-analysis of 36 experimental and quasi-experimental studies. *Education Sciences, 16*(6), 816. https://doi.org/10.3390/educsci16060816

Hugging Face. (2026, July 16). *Security incident disclosure: July 2026*. https://huggingface.co/blog/security-incident-july-2026

Hui, J. (2018, May 16). AlphaGo Zero: A game changer (How it works?). *Medium*. https://jonathan-hui.medium.com/alphago-zero-a-game-changer-14ef6e45eba5

Kobiella, C., Flores López, Y. S., Waltenberger, F., Draxler, F., & Schmidt, A. (2024). “If the machine is as good as me, then what use am I?” How the use of ChatGPT changes young professionals' perception of productivity and accomplishment. In *Proceedings of the CHI Conference on Human Factors in Computing Systems* (Article 170, pp. 1–16). Association for Computing Machinery. https://doi.org/10.1145/3613904.3641964

Krizhevsky, A., Sutskever, I., & Hinton, G. E. (2017). ImageNet classification with deep convolutional neural networks. *Communications of the ACM, 60*(6), 84–90. https://doi.org/10.1145/3065386

Larsen, T., Dean, R., Halstead, B., Lifland, E., Greenblatt, R., & Kokotajlo, D. (n.d.). *Plan A*. AI 2040. https://ai-2040.com/

Lighthill, J. (1973). Artificial intelligence: A general survey. In *Artificial intelligence: A paper symposium* (pp. 1–21). Science Research Council.

McCarthy, J., Minsky, M. L., Rochester, N., & Shannon, C. E. (2006). A proposal for the Dartmouth Summer Research Project on Artificial Intelligence, August 31, 1955. *AI Magazine, 27*(4), 12–14. https://doi.org/10.1609/aimag.v27i4.1904

Minsky, M., & Papert, S. (1969). *Perceptrons: An introduction to computational geometry*. MIT Press.

National Conference of State Legislatures. (2026, July 1). *Which states are banning data centers?* https://www.ncsl.org/fiscal/which-states-are-banning-data-centers

Nilsson, N. J. (2009). *The quest for artificial intelligence: A history of ideas and achievements*. Cambridge University Press. https://doi.org/10.1017/CBO9780511819346

OpenAI. (2026, August 26). *The Hugging Face incident and the road ahead*. https://openai.com/index/hugging-face-incident-and-the-road-ahead/

Radojević, D. (2020, June 10). Paper insight: Mastering Atari, Go, chess and shogi by planning with a learned model. *Nordeus Engineering*. https://engineering.nordeus.com/mastering-atari-go-chess-and-shogi-by-planning-with-a-learned-model/

Rosenblatt, F. (1958). The perceptron: A probabilistic model for information storage and organization in the brain. *Psychological Review, 65*(6), 386–408. https://doi.org/10.1037/h0042519

Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature, 323*(6088), 533–536. https://doi.org/10.1038/323533a0

Russell, S., & Norvig, P. (2020). *Artificial intelligence: A modern approach* (4th ed.). Pearson.

Silver, D., Huang, A., Maddison, C. J., Guez, A., Sifre, L., van den Driessche, G., Schrittwieser, J., Antonoglou, I., Panneershelvam, V., Lanctot, M., Dieleman, S., Grewe, D., Nham, J., Kalchbrenner, N., Sutskever, I., Lillicrap, T., Leach, M., Kavukcuoglu, K., Graepel, T., & Hassabis, D. (2016). Mastering the game of Go with deep neural networks and tree search. *Nature, 529*(7587), 484–489. https://doi.org/10.1038/nature16961

Silver, D., Schrittwieser, J., Simonyan, K., Antonoglou, I., Huang, A., Guez, A., Hubert, T., Baker, L., Lai, M., Bolton, A., Chen, Y., Lillicrap, T., Hui, F., Sifre, L., van den Driessche, G., Graepel, T., & Hassabis, D. (2017). Mastering the game of Go without human knowledge. *Nature, 550*(7676), 354–359. https://doi.org/10.1038/nature24270

Solimito, S. (2019, February 2). Is AlphaStar really impressive? *Medium*. https://medium.com/@stefano.solimito/is-alphastar-really-impressive-31ab02bf0882

Temperton, J. (2019, January 24). This is how Google's DeepMind crushed puny humans at StarCraft. *Wired*. https://www.wired.com/story/deepmind-starcraft-results-alphastar/

Turner Lee, N., & West, D. M. (2026, July 28). Data center moratoriums are not a substitute for oversight. *Brookings*. https://www.brookings.edu/articles/data-center-moratoriums-are-not-a-substitute-for-oversight/

Turing, A. M. (1950). Computing machinery and intelligence. *Mind, 59*(236), 433–460. https://doi.org/10.1093/mind/LIX.236.433

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. In I. Guyon, U. V. Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, & R. Garnett (Eds.), *Advances in neural information processing systems* (Vol. 30, pp. 5998–6008). Curran Associates, Inc.

The White House. (2025, December 11). *Ensuring a national policy framework for artificial intelligence*. https://www.whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy/

The White House. (2026, June 2). *Promoting advanced artificial intelligence innovation and security*. https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/

Willingham, D. (2026, August 20). Students should only use AI for things they already know how to do well. *Substack*. https://dtwuva.substack.com/p/students-should-only-use-ai-for-things

World Economic Forum. (2023). *The future of jobs report 2023*. https://www.weforum.org/publications/the-future-of-jobs-report-2023/
<!--
## Glossary of key terms

[AlexNet](https://doi.org/10.1145/3065386)
: A deep convolutional neural network developed by Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton. Its decisive performance in the 2012 ImageNet Large Scale Visual Recognition Challenge demonstrated the effectiveness of training deep neural networks with large labeled datasets and graphics processing units (GPUs).

[Backpropagation](https://en.wikipedia.org/wiki/Backpropagation)
: An optimization algorithm for artificial neural networks that calculates the gradient of the loss function with respect to each weight via the chain rule, updating weights backward through network layers.

[Combinatorial Explosion](https://en.wikipedia.org/wiki/Combinatorial_explosion)
: A rapid, exponential increase in computational steps required to solve a problem as input size or search space grows, often making brute-force or naive search methods intractable.

[Connectionism](https://plato.stanford.edu/entries/connectionism/)
: An approach in cognitive science and AI that models mental or behavioral phenomena using interconnected networks of simple processing units (artificial neural networks), contrasting with symbolic rule-based systems.

[Convolutional Neural Network (CNN)](https://en.wikipedia.org/wiki/Convolutional_neural_network)
: A specialized deep learning architecture that applies sliding filter matrices (convolutions) across multidimensional data, making it particularly effective for spatial and image processing tasks.

[Exclusive OR (XOR)](https://en.wikipedia.org/wiki/Exclusive_or)
: A fundamental logical operation that outputs true ($1$) if and only if an odd number of its binary inputs are true (for two inputs, exactly one input is true and the other is false). If both inputs are identical ($0,0$ or $1,1$), it outputs false ($0$).

[Expert System](https://en.wikipedia.org/wiki/Expert_system)
: A form of knowledge-based AI prevalent in the 1980s that pairs a curated database of domain-specific facts and heuristic "IF-THEN" rules with an inference engine to simulate human specialist reasoning.

[Foundation Model](https://crfm.stanford.edu/report.html)
: A large-scale neural network trained on broad, massive datasets via self-supervised learning that can be adapted or fine-tuned to a wide range of downstream applications.

[ImageNet](https://www.image-net.org/)
: A large, human-annotated image dataset organized according to the WordNet hierarchy. Its associated visual recognition challenge provided a standardized benchmark for measuring progress in image classification and helped drive advances in deep learning and computer vision.

[LISP Machine](https://en.wikipedia.org/wiki/Lisp_machine)
: A specialized computer workstation commercially sold during the late 1970s and 1980s designed to natively execute the Lisp programming language via microcode hardware acceleration.

[Monte Carlo Tree Search (MCTS)](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search)
: A heuristic search algorithm for decision-making processes, frequently used in complex games, that evaluates potential actions by simulating random or guided rollouts from given states.

[Non-determinism](https://en.wikipedia.org/wiki/Deterministic_algorithm)
: A property of a system whose output is not fully determined by its input, allowing the same input to produce different outputs across runs.

[Perceptron](https://en.wikipedia.org/wiki/Perceptron)
: The earliest mathematical model of an artificial neuron, capable of classifying inputs into binary categories using weighted linear combinations.

[Reward hacking](https://arxiv.org/pdf/2209.13085)
: Refers to situations where AI systems find unintended ways to achieve their objectives, often exploiting loopholes in the reward structure. This phenomenon highlights the challenges in designing robust and aligned AI systems, as agents may pursue strategies that technically maximize their reward but are misaligned with the intended goals or ethical considerations.

[Self-Attention Mechanism](https://en.wikipedia.org/wiki/Attention_(machine_learning))
: A sequence-processing layer within Transformer architectures that calculates dynamic alignment weights across all tokens in an input sequence simultaneously, capturing long-range contextual relationships without recurrent steps.

[Symbolic AI](https://en.wikipedia.org/wiki/Symbolic_artificial_intelligence)
: A paradigm that models intelligence by manipulating explicit, human-readable symbols according to formal logic and heuristic search rules.

[XOR Problem](https://en.wikipedia.org/wiki/Perceptrons_(book))
: The historical limitation where a single-layer perceptron cannot compute the Exclusive OR (XOR) logical function. Because XOR outputs cannot be separated by a single linear boundary (they are not linearly separable), this proved that single-layer neural networks could not solve non-linear tasks without hidden layers and non-linear activation functions. -->
