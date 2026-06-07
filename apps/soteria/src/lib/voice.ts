export const voice = {
	brandName: "Lifeline",
	dispatchFooter: "999 dispatch · Hong Kong",

	landing: {
		headline: "Be there before the sirens.",
		subtitle:
			"When there's an emergency nearby, 999 calls volunteers who can get there fast — often before ambulances do.",
		cta: "Become a volunteer",
		consent: "You'll be called when on duty and close to an emergency",
		features: [
			{
				title: "Called in an emergency",
				description: "On duty and nearby? 999 rings your phone.",
			},
			{
				title: "Skills 999 can use",
				description: "CPR, first aid, and more — matched to the incident.",
			},
			{
				title: "Minutes, not kilometres",
				description: "In Hong Kong, the closest volunteer is often the fastest help.",
			},
		],
	},

	profile: {
		greeting: (name: string) => `Hi, ${name}`,
		greetingHint: "Thanks for showing up for the city.",
		skillsTitle: "Your skills",
		skillsHint: "What 999 can match you to when you're on call",
		addSkill: "Add skill",
		chooseSkill: "Choose a skill",
		noSkills: "Add skills so dispatch knows when to call you.",
		verifyPrompt: "Photograph your certificate to verify",
	},

	availability: {
		offTitle: "Off duty",
		offHint: (duration: string) => `Tap to go on call · ${duration}`,
		onTitle: "On call for 999",
		onHint: (remaining: string | null) => (remaining ? `${remaining} left on call` : "You're on call"),
	},

	register: {
		phoneTitle: "Your HK mobile",
		phoneSubtitle: "We'll text a code — same number dispatch will call.",
		phonePlaceholder: "+852 9123 4567",
		verifySubtitle: (masked: string) => `Code sent to ${masked}`,
		infoTitle: "Almost there",
		infoSubtitle: "So dispatch knows who they're calling.",
		skillsTitle: "What you bring",
		skillsSubtitle: "Pick your skills — verify later.",
		skillsConfirm: "These are my real skills.",
		completeSignup: "Join the network",
	},
} as const;
