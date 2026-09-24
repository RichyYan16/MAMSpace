const universities = [
    "Harvard University",
    "Stanford University",
    "University of California Berkeley",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "University of Oxford",
    "Cambridge University",
];

export function useUniversities(): { universities: string[] } {
    return { universities };
}