export const getPlayerStatistics = async (userId) => {
  const { data, error } = await supabaseBrowser
    .from("player_statistics")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const getAllPlayerStatistics = async (filters = {}) => {
  let query = supabaseBrowser.from("player_statistics").select("*");

  if (filters.position) {
    query = query.eq("preferred_position", filters.position);
  }

  if (filters.role) {
    query = query.eq("role", filters.role);
  }

  if (filters.orderBy) {
    query = query.order(filters.orderBy, {
      ascending: filters.ascending || false,
    });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
