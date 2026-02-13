export function validatePlayer(name, { required = false } = {}) {
    if (required && !name.trim()) {
        return "Le pseudo est obligatoire.";
    }

    if (!name) return null; // cas update sans modification

    if (name.length > 20) {
        return "Le pseudo doit contenir maximum 20 caractères.";
    }

    const regex = /^[a-zA-Z0-9]+$/;

    if (!regex.test(name)) {
        return "Le pseudo doit contenir uniquement des lettres et des chiffres.";
    }

    return null; // valide
}
