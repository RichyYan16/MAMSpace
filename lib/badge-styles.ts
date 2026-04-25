export const getRoleBadgeVariant = (role: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} => {
  switch (role.toLowerCase()) {
    case "alumni":
      return {
        variant: "outline",
        className: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
      };
    case "project advisor":
      return {
        variant: "outline", 
        className: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      };
    case "stem fair judge":
      return {
        variant: "outline",
        className: "bg-purple-500 text-white border-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
      };
    case "student":
      return {
        variant: "outline",
        className: "bg-green-500 text-white border-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
      };
    case "community service":
      return {
        variant: "outline",
        className: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
      };
    case "guest speaker":
      return {
        variant: "outline",
        className: "bg-pink-500 text-white border-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700"
      };
    case "internship":
      return {
        variant: "outline",
        className: "bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
      };
    case "physical education":
      return {
        variant: "outline",
        className: "bg-red-500 text-white border-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
      };
    default:
      return {
        variant: "secondary",
        className: ""
      };
  }
};

export const getExpertiseBadgeVariant = (expertise: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} => {
  const exp = expertise.toLowerCase().trim();
  
  if (exp.includes('computer science') || exp.includes('computer') && !exp.includes('mechanical')) {
    return {
      variant: "outline",
      className: "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700"
    };
  }
  if (exp.includes('biology') || exp.includes('bio')) {
    return {
      variant: "outline",
      className: "bg-green-500 text-white border-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
    };
  }
  if (exp.includes('chemistry') || exp.includes('chem')) {
    return {
      variant: "outline",
      className: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
    };
  }
  if (exp.includes('engineering') || exp.includes('engineer')) {
    return {
      variant: "outline",
      className: "bg-gray-500 text-white border-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
    };
  }
  if (exp.includes('mathematics') || exp.includes('math') && !exp.includes('mechanical')) {
    return {
      variant: "outline",
      className: "bg-purple-500 text-white border-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
    };
  }
  if (exp.includes('physics') || exp.includes('phys')) {
    return {
      variant: "outline",
      className: "bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
    };
  }
  if (exp.includes('foreign language') || exp.includes('language')) {
    return {
      variant: "outline",
      className: "bg-pink-500 text-white border-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700"
    };
  }
  if (exp.includes('government relations') || exp.includes('government')) {
    return {
      variant: "outline",
      className: "bg-red-500 text-white border-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
    };
  }
  if (exp.includes('humanities') || exp.includes('human')) {
    return {
      variant: "outline",
      className: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
    };
  }
  
  // Fallback to broader matches
  if (exp.includes('cs') || exp.includes('programming')) {
    return {
      variant: "outline",
      className: "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700"
    };
  }
  if (exp.includes('stat') || exp.includes('calc')) {
    return {
      variant: "outline",
      className: "bg-purple-500 text-white border-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
    };
  }
  
  // Default case - give it a visible color instead of secondary
  return {
    variant: "outline",
    className: "bg-gray-500 text-white border-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
  };
};
