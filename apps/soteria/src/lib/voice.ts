export const voice = {
	brandName: "Lifeline",
	dispatchFooter: "999 dispatch · Hong Kong",

	landing: {
		headline: "Be there before the sirens.",
		subtitle: "999 dispatch calls neighbours who can walk to an incident — often faster than traffic.",
		cta: "Join as a neighbour",
		consent: "SMS alerts when you're on duty",
		features: [
			{
				title: "Called when nearby",
				description: "Your phone rings when you're close enough to help.",
			},
			{
				title: "Skills 999 can use",
				description: "CPR, first aid, and more — matched to the incident.",
			},
			{
				title: "Minutes, not kilometres",
				description: "In Hong Kong, the nearest neighbour is often the fastest help.",
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
		offHint: "Pick a duration, then tap",
		confirmTitle: "Go on call?",
		confirmHint: (duration: string) => `Tap again · ${duration}`,
		onTitle: "On call for 999",
		onHint: (remaining: string | null) => remaining ?? "Ready for nearby incidents",
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
