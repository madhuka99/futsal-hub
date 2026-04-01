import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Function to check user role
export async function checkUserRole(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data?.role || "user";
  } catch (error) {
    console.error("Error checking user role:", error);
    return "user"; // Default to user role
  }
}

// Create a new user profile if it doesn't exist
export async function createUserProfileIfNotExists(supabase, user) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGNF") {
    console.error("Error checking if profile exists:", error);
    return;
  }

  // If profile doesn't exist, create it
  if (!data) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      role: "user", // Default role
    });

    if (insertError) {
      console.error("Error creating user profile:", insertError);
    }
  }
}
