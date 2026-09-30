import type { TutorialsData } from '../types';

export const tutorials: TutorialsData = {
	schedule: {
		day: 'July 28, 2026',
		venue_opens: '8:00am',
		morning_time: '9:00am - 12:00pm',
		afternoon_time: '1:00pm - 4:00pm',
		coffee_break_one: '10:30am',
		coffee_break_two: '4:00pm',
		morning_tutorials: [1, 2, 3, 4, 5],
		afternoon_tutorials: [6, 7, 8, 9, 10]
	},
	items: [
		{
			id: 1,
			title: 'Comprehensive TikTok Data Collection for Computational Social Science',
			time: '9:00am - 12:00pm',
			room: 'Williams (403)',
			abstract: `This hands-on tutorial provides researchers with practical tools and frameworks for TikTok data collection for Computational Social Science. Recent work systematically testing three TikTok data collection techniques reveals TikTok data collection method decisions dramatically alters research results. Participants in our tutorial will learn how to use web-scraping data collection methods (Pyktok and Apify) as well as the official TikTok Research API. This tutorial will explore best practices for data collection from three endpoints---Users, Hashtags, and Comments---using strategies identified through stress testing that: 1) Reduce algorithmic selection bias in data collection; 2) Substitute or fill missing data by combining multiple tools for a more complete dataset; and 3) Improve collection efficiency by balancing resources and dataset size (including strategies to minimize resource waste). Lastly, we introduce a checklist for reporting data collection procedures and results to increase the transparency, replicability, and generalizability of TikTok research. By engaging in this tutorial, researchers will be equipped with actionable methods to obtain high-quality TikTok datasets and decision-making criteria for optimizing collection parameters to answer empirical TikTok research questions.`,
			tutors: [
				{
					name: 'Gayoung Jeon',
					affiliation:
						'PhD student, Annenberg School for Communication, University of Pennsylvania',
					image: '/images/tutorials/gayoung_jeon.avif'
				},
				{
					name: 'Cameron Moy',
					affiliation:
						'PhD student, Annenberg School for Communication, University of Pennsylvania',
					image: '/images/tutorials/cameron_moy.avif'
				},
				{
					name: 'Deen Freelon',
					affiliation:
						'Allan Randall Freelon Sr. Professor and Presidential Professor, Annenberg School for Communication, University of Pennsylvania; Director, Politics, Identities, and Communication Lab (PICL)',
					image: '/images/tutorials/deen_freelon.avif'
				}
			]
		},
		{
			id: 2,
			title: 'Beyond APIs: Collecting Online Activity Data for Research using the National Internet Observatory',
			time: '9:00am - 12:00pm',
			room: 'Mansfield (210)',
			website: 'https://national-internet-observatory.github.io/beyondapi_ic2s2_26/',
			abstract: `Learn about an alternative framework to collect online activity data for academic research, especially as we face challenges in obtaining data directly from various online platforms! This tutorial will provide a comprehensive overview of a volunteer-sourced data collection mechanism, which will help you set up your own data collection as well as apply for access to obtain data we have collected from thousands of US-based participants \u2014 cross-platform, cross-device data on the content participants are exposed to, along with survey responses, including social media and AI platforms and apps! We will gain an acute understanding of this alternative data collection mechanism as well as the data being collected by the existing setup, and learn about the research that can be conducted by such data.`,
			tutors: [
				{
					name: 'Pranav Goel',
					affiliation:
						'Postdoctoral Research Associate, Network Science Institute, Northeastern University, USA',
					image: '/images/tutorials/pranav.jpeg'
				},
				{
					name: 'Scott Allen Cambo',
					affiliation:
						'Senior Data Scientist and Director of Data Science, National Internet Observatory (NIO), Northeastern University',
					image: '/images/tutorials/scott.png'
				},
				{
					name: 'Jason Radford',
					affiliation:
						'Research scientist with the National Internet Observatory and Director of the Social Design Lab, Northeastern University',
					image: '/images/tutorials/jason_radford.png'
				},
				{
					name: 'David Lazer',
					affiliation:
						'University Distinguished Professor of Political Science and Computer Sciences, Network Science Institute, Northeastern University',
					image: '/images/tutorials/david.jpeg'
				}
			]
		},
		{
			id: 3,
			title: 'Computational Tools for Measuring Collective Attention in Corpora of Text',
			time: '9:00am - 12:00pm',
			room: 'Chittenden (413)',
			website: 'https://vermont-complex-systems.github.io/ic2s2-tutorials/storywrangler',
			abstract: `This tutorial introduces the "StoryWrangler" project, a platform for analyzing massive large-scale corpora such as Twitter, Wikipedia, Bluesky, Reddit, and Google Books. Despite their differences, these platforms exhibit similar heavy-tailed statistical properties, allowing consistent analytical frameworks while respecting platform-specific dynamics.\n\nWe show how StoryWrangler platform implements principled measurements such as rank-turbulence divergence to detect and quantify changes in text over time. These instruments help identify when language use shifts dramatically, track the rise and fall of narratives, and compare patterns across timescales and platforms. We discuss the technical challenge of providing different levels of technical accessibility: front-end portals for visual exploration without coding, Python packages for custom analyses, and API access for large-scale studies.`,
			tutors: [
				{
					name: 'Michael Arnold',
					affiliation:
						'Research Computing Data Engineer, Vermont Complex Systems Institute',
					image: '/images/tutorials/michael-arnold.jpg'
				},
				{
					name: 'Ben Dexter Cooley',
					affiliation:
						'Creative Technologist and Data Visualization Engineer, Vermont Complex Systems Institute',
					image: '/images/tutorials/ben.jpg'
				},
				{
					name: 'Jonathan St-Onge',
					affiliation:
						'Research Software Engineer, Vermont Complex Systems Institute',
					image: '/images/tutorials/jso.jpg'
				}
			]
		},
		{
			id: 4,
			title: 'Podcasts as Social Data: End-to-End Pipelines for Large-Scale Audio, Text, and Network Analysis',
			time: '9:00am - 12:00pm',
			room: 'Silver Maple (401)',
			abstract: "Podcasts represent a rapidly growing and underutilized data source for computational social science. Unlike short-form social media, podcasts feature long-form, conversational public discourse in which speakers explain ideas, negotiate meaning, and interact over extended periods of time. In the era of limited access to social media data, podcasts represent a rich potential source of information for social scientists to study the public discourse, people, and conversation in general.\n\nThis tutorial introduces podcasts as a distinct computational medium and presents end-to-end pipelines for conducting research using podcast data at different scales. Drawing on the presenters' experience building large-scale podcast corpora (SPoRC) and conducting empirical studies across multiple domains, the tutorial walks through the full research lifecycle: podcast collection, audio processing, transcription and alignment, annotation of conversational and discourse phenomena, and downstream analysis using text, audio, and network-based methods.\n\nA central theme of the tutorial is how podcasts enable new classes of research questions that are difficult to study using other data sources. For example, long-form conversation allows speakers to articulate reasoning, enabling richer analyses of intent or framing. Repeated appearances of speakers across different podcasts allow researchers to study how ideas evolve across contexts and time. The tutorial also highlights the role of podcast networks as well---shows, hosts, guests, and production ecosystems---as a meso-level structure connecting individual discourse to broader cultural and political dynamics.",
			tutors: [
				{
					name: 'David Jurgens',
					affiliation:
						'Associate Professor, School of Information and Department of Computer Science & Engineering, University of Michigan',
					image: '/images/tutorials/david_jurgens.jpeg'
				},
				{
					name: 'Dallas Card',
					affiliation:
						'Assistant Professor, School of Information, University of Michigan',
					image: '/images/tutorials/dallas_card.jpg'
				}
			]
		},
		{
			id: 5,
			title: 'Building Multiplayer Experiments with Humans and LLM Agents',
			time: '9:00am - 12:00pm',
			room: 'Jost Foundation (422)',
			abstract: 'Description: This tutorial introduces both the theoretical foundations and practical workflows for studying collective decision making with human participants and LLM agents. Participants will first learn psychological perspectives on collective decision making and how individual decisions give rise to emergent group level patterns. The tutorial then guides participants through a unified experimental workflow that integrates multiplayer human experiments using Empirica with moderator driven multiagent LLM simulations. Through interactive examples, participants will work through experimental design, simulation, data analysis, and cognitive interpretation of collective decision outcomes. By the end of the tutorial, participants will have practical tools for designing and evaluating multiplayer experiments with humans, LLM agents, or both.',
			website: "https://github.com/jouisseuse/IC2S2-26-Tutorial",
			tutors: [
				{
					name: 'Bufan Gao',
					affiliation:
						'PhD student, Department of Psychology, University of Chicago',
					image: '/images/tutorials/bufan.png'
				},
				{
					name: 'Xuechunzi Bai',
					affiliation:
						'Neubauer Family Assistant Professor of Psychology and Director of the Computational Social Cognition Lab, University of Chicago',
					image: '/images/tutorials/XuechunziBai.jpeg'
				}
			]
		},
		{
			id: 6,
			title: 'Social Media Feed Ranking Algorithms: Guide to Field Experiments',
			time: '1:00pm - 4:00pm',
			room: 'Mansfield (210)',
			website:  'https://social-media-ais.github.io/ic2s2-26-tutorial/',
			abstract: `Feed ranking algorithms select and prioritize what users see from a vast inventory of content on social media. They greatly impact people's opinions, moods, and actions. Typically trained to maximize user engagement (e.g., likes, replies, and reposts), feed ranking algorithms are often blamed for exacerbating negative societal outcomes, like political polarization and toxic speech online. Until recently, running feed ranking experiments and studying the effects of feed ranking algorithms was only possible from inside social media companies. However, the emergence of middleware-based feed reranking infrastructure and more customizable platforms like Bluesky have created new opportunities for experimentation. This tutorial aims to introduce participants to these new experimental opportunities and provide a practical guide for conducting feed-ranking experiments through a mix of lectures, a case study, and hands-on exercises.`,
			tutors: [
				{
					name: 'Martin Saveski',
					affiliation: 'Assistant Professor, University of Washington',
					image: '/images/tutorials/headshot-saveski.jpg'
				},
				{
					name: 'Tiziano Piccardi',
					affiliation: 'Assistant Professor, Johns Hopkins University',
					image: '/images/tutorials/headshot-piccardi.jpg'
				}
			]
		},
		{
			id: 7,
			title: 'Where Creativity Meets Data-Driven Stories: Building Interactive Data Visualizations in Computational Social Science',
			time: '1:00pm - 4:00pm',
			room: 'Silver Maple (401)',
			website: 'https://vermont-complex-systems.github.io/ic2s2-tutorials/dataviz',
			abstract: `Visual data essays and dashboards are useful in drawing attention and communicating important ideas from computational social sciences to stakeholders and the broader public. Yet, what begins as a simple dataviz project often becomes increasingly hard to manage and maintain because of complexities well-known by web designers but hidden from adventurous researchers. This tutorial offers a whirlwind tour of various challenges and lessons learned from building all kinds of interactive data-driven visualizations at the Vermont Complex Systems Institute.\n\nThrough concrete case studies, we discuss multiple facets of building whimsical yet robust and performant interactive dataviz in computational social science. We address data management issues, the design of interactive stories, performance, hosting on university premises, pros and cons of alternatives such as BI tools or interactive notebooks in scientific programming languages, and other considerations when deploying modern websites. We address the risk of interactive visualization rot head-on, discussing why all the hard work going into interactive dataviz can be nullified by the lack of engagement from users or disinterested stakeholders. Lastly, we briefly touch on how generative AI is currently changing the landscape of building interactive dataviz and how we use it in our own work.`,
			tutors: [
				{
					name: 'Jonathan St-Onge',
					affiliation:
						'Research Software Engineer, Vermont Complex Systems Institute',
					image: '/images/tutorials/jso.jpg'
				},
				{
					name: 'Ben Dexter Cooley',
					affiliation:
						'Creative Technologist and Data Visualization Engineer, Vermont Complex Systems Institute',
					image: '/images/tutorials/ben.jpg'
				}
			]
		},
		{
			id: 8,
			title: 'Computational Research for Municipal Politics at Scale',
			time: '1:00pm - 4:00pm',
			room: 'Chittenden (413)',
			abstract: "Municipal politics shapes daily life in ways that national politics often does not — routing transit, deciding zoning, setting local wage standards, and regulating policing. Yet studying local government computationally at scale is difficult: standardized data sources are few, political institutions are heterogeneous in ways that frustrate comparison across jurisdictions, record-keeping is inconsistent, and programmatic access to municipal proceedings is limited. As a result, there is little longitudinal or comparative computational work on local politics, despite its outsized influence on residents' lives.\n\nThis tutorial introduces participants to methods and tools for overcoming some of these barriers. Using interactive notebooks, we will collect and analyze public comment and online petition data. And, we will spend time discussion how to build a stronger research community around local politics within computational social science.\n\n\Participants will leave with practical skills for collecting and analyzing municipal data, open-source tools and notebooks adaptable to their own national or regional contexts, and a foundation for conducting comparative research on local democracy. Sub-topics of particular interest to IC2S2 participants may include the spread of misinformation in local meetings, the diffusion of policy topics across municipalities, and the influence of special interest groups at the local level.",
			tutors: [
				{
					name: 'Sabina Tomkins',
					affiliation:
						'Assistant Professor, School of Information and Faculty Associate, Center for Political Studies, University of Michigan',
					image: '/images/tutorials/sabina_tomkins.jpg'
				},
				{
					name: 'Nic Weber',
					affiliation:
						'Associate Professor, Information School, University of Washington',
					image: '/images/tutorials/nicholas_weber.jpg'
				}
			]
		},
		{
			id: 9,
			title: 'An Introduction to Simulating Human Survey Responses with Large Language Models: Potentials and Pitfalls',
			time: '1:00pm - 4:00pm',
			room: 'Jost Foundation (422)',
			website: 'https://dess-mannheim.github.io/tutorial_simulating_survey_responses/',
			abstract: `This tutorial provides a hands-on introduction to simulating human survey responses with Large Language Models (LLMs), focusing on the methodological rigor required to use "silicon samples" to complement or extend human data. While this approach offers promise for rapid pretesting, counterfactual analysis, and enhancing statistical power through mixed-subjects designs, it introduces new methodological choices, assumptions, and risks that require careful scrutiny.\n\nTo that end, this tutorial addresses analytic flexibility in silicon samples. Participants will learn to systematically explore how design decisions\u2014such as persona construction and prompting strategies\u2014meaningfully shift results, rather than treating LLM outputs as fixed. The tutorial introduces the QSTN framework, a tool designed to structure simulations and support transparent evaluation across design alternatives. Through guided Python exercises, participants will generate simulated responses for use cases like missing-data imputation and compare modelling choices using multiple evaluation metrics. The tutorial concludes with a critical discussion of methodological limitations, validation challenges, and ethical considerations surrounding autonomy and appropriate use cases for silicon samples. By the end of the tutorial, researchers will be equipped with a principled, transparent approach to integrating simulations into survey-centric social science workflows.`,
			tutors: [
				{
					name: 'Georg Ahnert',
					affiliation: 'PhD student, Social Data Science, University of Mannheim',
					image: '/images/tutorials/georg.jpeg'
				},
				{
					name: 'Maximilian Kreutner',
					affiliation: 'PhD student, Computer Science, University of Mannheim',
					image: '/images/tutorials/maximilian.png'
				},
				{
					name: 'Jens Rupprecht',
					affiliation: 'PhD student, Computer Science, University of Mannheim',
					image: '/images/tutorials/jens.png'
				},
				{
					name: 'Markus Strohmaier',
					affiliation:
						'Full Professor of Data Science for the Social and Economic Sciences, University of Mannheim; Scientific Coordinator for Digital Behavioral Data, GESIS\u2014Leibniz Institute for the Social Sciences',
					image: '/images/tutorials/markus.jpeg'
				},
				{
					name: 'Kristina Gligori\u0107',
					affiliation:
						'Assistant Professor, Department of Computer Science, Johns Hopkins University',
					image: '/images/tutorials/kristina.jpeg'
				},
				{
					name: 'Indira Sen',
					affiliation: 'Junior Faculty, Business School, University of Mannheim',
					image: '/images/tutorials/indira.png'
				}
			]
		},
		{
			id: 10,
			title: 'Mitigating Influence Campaigns on Social Media',
			time: '1:00pm - 4:00pm',
			room: 'Williams (403)',
			abstract: `In this tutorial, we will summarize the state of the art in automated identification of fraudulent online material, highlighting recent changes associated with the increased capabilities of Generative AI. The tutorial will focus in particular on
<ul>
  <li>the development of robust techniques to identify narratives used by previously identified inauthentic online accounts, (not only of text but also of images and videos),</li>
  <li>the characteristics of narratives used by adversarial actors, with the goal of identifying future harmful narratives irrespective of the content being shared, and</li>
  <li>flagging new inauthentic accounts, and learning their behavioral patterns for more effective detection.</li>
</ul>`,
			tutors: [
				{
					name: 'Gianluca Stringhini',
					affiliation:
						'Associate Professor, Department of Electrical and Computer Engineering, Boston University',
					image: '/images/tutorials/gianluca.jpg'
				},
				{
					name: 'Jeremy Blackburn',
					affiliation:
						'Associate Professor, School of Computing and Director of the Institute for AI and Society, Binghamton University',
					image: '/images/tutorials/jblackbu.jpg'
				},
				{
					name: 'Chris Danforth',
					affiliation:
						'Professor, Department of Mathematics and Statistics, University of Vermont',
					image: '/images/tutorials/chris.jpg'
				}
			]
		}
	],
	past_tutorials: [
		{
			title: 'LLM Power to the People \u270A',
			abstract: `This tutorial aims to provide an up-to-date overview of the applications of large language models (LLMs) in research, with a particular focus on key areas such as fine-grained text classification, information extraction, and text clustering. To this end, it will cover fundamental concepts, including zero-shot learning, fine-tuning, encoder-decoder architectures, and Low-Rank Adaptation (LoRA), while also presenting various types of language models and their respective affordances.\n\nDrawing on the most recent discussions in the field, the tutorial will offer guidance on developing efficient processing pipelines, taking into consideration the computational resources available to researchers. Participants will gain practical knowledge through a combination of theoretical discussions and hands-on case studies.`,
			tutors: [
				{
					name: '\u00C9tienne Ollion',
					affiliation: 'Professor of Sociology, Ecole Polytechnique, Paris, France'
				},
				{
					name: '\u00C9milien Schultz',
					affiliation:
						'Senior Data Scientist, CREST-Institut Polytechnique de Paris, France'
				}
			]
		},
		{
			title: 'Bridging Human and LLM Annotations for Statistically Valid Computational Social Science',
			abstract: `The tutorial provides participants with a practical, hands-on experience in integrating Large Language Models (LLMs) and human annotations to streamline annotation workflows, ensuring both efficiency and statistical rigor.`,
			tutors: [
				{
					name: 'Kristina Gligori\u0107',
					affiliation: 'Postdoctoral Scholar, Computer Science, Stanford University'
				},
				{
					name: 'Cinoo Lee',
					affiliation: 'Postdoctoral Scholar, Psychology, Stanford University'
				},
				{
					name: 'Tijana Zrnic',
					affiliation:
						'Ram and Vijay Shriram Postdoctoral Fellow, Stanford Data Science, Stanford University'
				}
			]
		},
		{
			title: 'The Role of AI in Misinformation: Current Trends, Detection, and Mitigation',
			abstract: `As AI-generated content becomes more prevalent, understanding its role within the broader misinformation landscape is critical. The widespread proliferation of misinformation in combination with the rise of AI technologies poses challenges across domains.`,
			tutors: [
				{
					name: 'Miriam Schirmer',
					affiliation: 'Postdoctoral Scholar, Northwestern University'
				},
				{
					name: 'Julia Mendelsohn',
					affiliation: 'Postdoctoral Scholar, University of Chicago'
				},
				{
					name: 'Dustin Wright',
					affiliation: 'Postdoctoral Fellow, University of Copenhagen'
				},
				{
					name: 'Dietram A. Scheufele',
					affiliation:
						'Taylor-Bascom Chair and Vilas Distinguished Achievement Professor, University of Wisconsin-Madison'
				},
				{
					name: '\u00C1gnes Horv\u00E1t',
					affiliation:
						'Associate Professor of Communication and Computer Science, Northwestern University'
				}
			]
		},
		{
			title: 'Planetary Causal Inference: an R tutorial on how to conduct causal inference with satellite images data',
			abstract: `This R tutorial is based on our book-in-progress, Planetary Causal Inference (PCI), which proposes using Earth observation (EO) data to enhance social science research by expanding both the scope and resolution of data analysis.`,
			tutors: [
				{
					name: 'Adel Daoud',
					affiliation:
						'Associate Professor at Institute for Analytical Sociology, Link\u00F6ping University'
				},
				{
					name: 'Connor Jerzak',
					affiliation: 'Assistant Professor in Government, UT Austin'
				}
			]
		},
		{
			title: 'A Workflow for Open Reproducible Computational Social Science',
			abstract: `Reproducibility is essential for establishing trust and maximizing reusability of empirically calibrated simulations and other computational social science studies. Participants learn to make research projects open and reproducible according to the FAIR principles and TOP-guidelines.`,
			tutors: [
				{
					name: 'Caspar van Lissa',
					affiliation: 'Associate Professor, Tilburg University, Tilburg, Netherlands'
				}
			]
		},
		{
			title: 'Research Cartography with Atlas',
			abstract: `Scientific inquiry depends on "standing on the shoulders of giants" \u2014 building on the findings of prior work. However integrating knowledge across many papers is challenging and unreliable. Atlas, an open source platform, tackles this problem by emphasizing commensurability.`,
			tutors: [
				{
					name: 'Mark Whiting',
					affiliation:
						'CTO, Pareto Inc. and visiting scientist at University of Pennsylvania'
				},
				{
					name: 'Linnea Gandhi',
					affiliation:
						'Lecturer and PhD candidate at Wharton at University of Pennsylvania'
				},
				{
					name: 'Amirhossein Nakhaei',
					affiliation: 'M.Sc. Computational Social Science, RWTH Aachen'
				},
				{
					name: 'Duncan Watts',
					affiliation:
						'Stevens University Professor at University of Pennsylvania'
				}
			]
		},
		{
			title: 'Scalable Analysis of GPS Human Mobility Data with Applications to Socio-Spatial Inequality',
			abstract: `Large-scale human mobility datasets derived from mobile phones have become a valuable resource in the field of human mobility. They have found diverse applications in tasks such as travel demand estimation, urban planning, epidemic modelling, and more.`,
			tutors: [
				{
					name: 'Jorge Barreras',
					affiliation:
						'Postdoc, University of Pennsylvania; Computational Social Science Lab (CSSLab), Wharton School'
				},
				{
					name: 'Thomas Li',
					affiliation:
						'M.Sc. Student, School of Engineering, University of Pennsylvania'
				},
				{
					name: 'Chen Zhong',
					affiliation:
						'Associate Professor in Urban Analytics, Centre for Advanced Spatial Analysis (CASA), UCL'
				},
				{
					name: 'Cate Heine',
					affiliation:
						'Research Fellow in Urban mobility and inequality, CASA UCL'
				},
				{
					name: 'Adam (Zhengzi) Zhou',
					affiliation: 'PhD student at CASA UCL'
				}
			]
		},
		{
			title: 'Mobility Flows and Accessibility Using R and Big Open Data',
			abstract: `Large-scale human mobility datasets provide unprecedented opportunities to analyze movement patterns, generating critical insights for many fields of research. This workshop addresses challenges by showcasing end-to-end workflows that harness state-of-the-art R packages and methods.`,
			tutors: [
				{
					name: 'Egor Kotov',
					affiliation:
						'PhD Student, Max Planck Institute for Demographic Research, Rostock, Germany'
				},
				{
					name: 'Johannes Mast',
					affiliation:
						'PhD Student, German Aerospace Center (Deutsches Zentrum f\u00FCr Luft- und Raumfahrt, DLR)'
				}
			]
		},
		{
			title: 'Reinforcement Learning and Evolutionary Game Theory are Two Sides of the Same Coin',
			abstract: `Assuming that individuals are rational is often unjustified in many social and biological systems, even for simple pairwise interactions. This tutorial shows how evolutionary game theory and multi-agent reinforcement learning, although applied in different contexts, are two sides of the same coin.`,
			tutors: [
				{
					name: 'Paolo Turrini',
					affiliation:
						'Associate Professor, Department of Computer Science, University of Warwick, UK'
				},
				{
					name: 'Elias Fern\u00E1ndez Domingos',
					affiliation:
						'Postdoctoral Researcher at the AI Lab, Vrije Universiteit Brussel, Belgium'
				}
			]
		},
		{
			title: 'Computational Social Science for Sustainability',
			abstract: `Humans face an existential challenge to transition to sustainable practices that do not exhaust available ecological, economic, and social capital. Computational social-cognitive models can be used to deduce the efficacy of potential training or educational interventions to promote sustainable practices.`,
			tutors: [
				{
					name: 'Matthew A. Turner',
					affiliation:
						'Lecturer in Environmental Social Sciences at the Stanford Doerr School of Sustainability, Stanford University'
				},
				{
					name: 'James Holland Jones',
					affiliation:
						'Professor, Environmental Social Sciences, Stanford Doerr School of Sustainability, Stanford University'
				}
			]
		},
		{
			title: 'Making Models We Can Understand: An Interactive Introduction to Interpretable Machine Learning',
			abstract: `In many areas of social science, we would like to use machine learning models to make better decisions. However, many machine learning models are opaque or "black-box." Interpretable machine learning models give insight into model decisions and can be used to create more fair and accurate models.`,
			tutors: [
				{ name: 'Chudi Zhong' },
				{ name: 'Alina Jade Barnett' },
				{ name: 'Harsh Parikh' }
			]
		},
		{
			title: 'New Approaches and Data Sources to Study Digital Media and Democracy',
			abstract: `As we head into a crucial election year, political forces and societal processes such as polarization or declining trust pose threats to the legitimacy of democratic institutions. This workshop aims to bring together research groups working on new technical solutions and innovative approaches for studying digital democracy.`,
			tutors: [
				{ name: 'Sebastian Stier' },
				{ name: 'Philipp Lorenz-Spreen' },
				{ name: 'Lisa Oswald' },
				{ name: 'David Lazer' }
			]
		},
		{
			title: 'Exploring Emerging Social Media: Acquiring, Processing, and Visualizing Data with Python and OSoMe Web Tools',
			abstract: `In the digital age, social media platforms have become crucial for societal interaction and communication. This tutorial aims to guide participants through new developments, highlighting the current approaches for accessing social media data and methodologies to understand this data.`,
			tutors: [
				{ name: 'Filipi Nascimento Silva' },
				{ name: 'Kaicheng Yang' },
				{ name: 'Bao Tran Truong' },
				{ name: 'Wanying Zhao' }
			]
		},
		{
			title: 'Collecting Digital Trace Data Through Data Donation',
			abstract: `This tutorial helps IC2S2 researchers understand and deploy an alternative to circumvent data access challenges. This alternative approach to gain access to digital traces is enabled thanks to the GDPR's right to data access and data portability and similar legislation.`,
			tutors: [
				{ name: 'Laura Boeschoten' },
				{ name: 'Niek de Schipper' }
			]
		},
		{
			title: 'Training Computational Social Science Ph.D. Students for Academic and Non-Academic Careers',
			abstract: `Social scientists with data science skills are increasingly assuming positions as computational social scientists. We provide an accessible tutorial for CSS training based on our collective working experiences in academic, public, and private sector organizations.`,
			tutors: [
				{ name: 'Jae Yeon Kim' },
				{ name: 'Tiago Ventura' },
				{ name: 'Aniket Kesari' },
				{ name: 'Sono Shah' },
				{ name: 'Tina Law' },
				{ name: 'Subhik Barari' },
				{ name: 'Sarah Shugars' }
			]
		},
		{
			title: 'Using LLMs for Computational Social Science',
			abstract: `Our tutorial will guide participants through the practical aspects and hands-on experiences of using Large Language Models (LLMs) in Computational Social Science (CSS). In recent years, LLMs have emerged as powerful tools capable of executing a variety of language processing tasks in a zero-shot manner.`,
			tutors: [
				{ name: 'Diyi Yang' },
				{ name: 'Caleb Ziems' },
				{ name: 'Niklas Stoehr' }
			]
		},
		{
			title: 'Thinking With Deep Learning: An Exposition Of Deep (Representation) Learning for Social Science Research',
			abstract: `A deluge of digital content is generated daily by web-based platforms and sensors. Emerging deep learning methods enable the integration and analysis of these complex data in order to address research and real-world problems.`,
			tutors: [
				{ name: 'James Evans' },
				{ name: 'Bhargav Srinivasa Desikan' }
			]
		},
		{
			title: 'Active Agents: An Active Inference Approach to Agent-Based Modeling in the Social Sciences',
			abstract: `This tutorial will teach attendees about Active Inference as an agent-based modeling framework and its application to computational social science. Active Inference is an integration of neuroscience and cognitive science which builds a normative theory for biological and social phenomena.`,
			tutors: [{ name: 'Andrew Pashea' }]
		},
		{
			title: 'The Dark Web: Harnessing the Platform for Social Science Research',
			abstract: `The dark web remains mysterious, with many struggling to comprehend its nature. This workshop aims to provide participants with an understanding of the dark web\u2014its functioning and how to access it, along with the ethical and legal considerations surrounding it.`,
			tutors: [{ name: 'Brady Lund' }]
		}
	]
};
