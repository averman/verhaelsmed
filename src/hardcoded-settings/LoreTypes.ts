const LoreTypes: {[loretype: string]: {keys: string[], description: string, idFrom?: string}} = {
    "character":  {
        description: "The description, background, and lore that makes up a character.",
        idFrom: "name",
        keys: ["name", "age", "gender", "personality", "background", "appearance", "preference",
            "profession", "likes", "dislikes", "goals", "state"],
            
    },
}

export default LoreTypes;