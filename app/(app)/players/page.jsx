"use client";
import React, { useEffect, useState } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { PlayerSearch } from "@/components/players/PlayerSearch";
import { PlayerStatsSummary } from "@/components/players/PlayerStatsSummary";
import { PlayerTable } from "@/components/players/PlayerTable";
import { PlayerEditModal } from "@/components/players/PlayerEditModal";

export function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("full_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [filters, setFilters] = useState({
    position: "",
    role: "",
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchPlayers();
    getCurrentUser();
  }, [sortField, sortDirection]);

  async function fetchPlayers() {
    try {
      setLoading(true);

      // Call the RPC function to get player statistics with last login
      const { data, error } = await supabaseBrowser.rpc('get_player_statistics_with_login');

      if (error) throw error;

      // Apply client-side filters since RPC doesn't support .ilike() or .eq()
      let filteredData = data || [];

      // Apply search filter
      if (searchTerm) {
        filteredData = filteredData.filter(p =>
          p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply position filter
      if (filters.position) {
        filteredData = filteredData.filter(p =>
          p.preferred_position === filters.position
        );
      }

      // Apply role filter
      if (filters.role) {
        filteredData = filteredData.filter(p => p.role === filters.role);
      }

      // Apply sorting
      if (sortField) {
        const columnMap = {
          draws: "draws",
          last_login: "last_sign_in_at",
        };
        const sortColumn = columnMap[sortField] || sortField;

        filteredData.sort((a, b) => {
          const getVal = (p) => sortColumn === 'draws'
            ? p.matches_played - p.wins - p.losses
            : p[sortColumn];
          const aVal = getVal(a);
          const bVal = getVal(b);

          // Handle null values (put at end)
          if (aVal === null && bVal === null) return 0;
          if (aVal === null) return 1;
          if (bVal === null) return -1;

          // Sort based on type
          if (typeof aVal === 'string') {
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }

          // For numbers and dates
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }

      setPlayers(filteredData);
    } catch (err) {
      console.error("Error fetching players:", err);
    } finally {
      setLoading(false);
    }
  }

  async function getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (user) {
        const { data } = await supabaseBrowser
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    fetchPlayers();
  };

  const resetFilters = () => {
    setFilters({ position: "", role: "" });
    // fetch right away
    setTimeout(fetchPlayers, 0);
  };

  const openPlayerModal = (player = null) => {
    setCurrentPlayer(player);
    setIsModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsModalOpen(false);
    setCurrentPlayer(null);
  };

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      const updates = {
        full_name: form.full_name.value,
        preferred_position: form.preferred_position.value,
        role: form.role.value,
      };

      const { error } = await supabaseBrowser
        .from("profiles")
        .update(updates)
        .eq("id", currentPlayer.id);

      if (error) throw error;

      // Refresh the players list to get updated statistics
      fetchPlayers();

      closePlayerModal();
    } catch (err) {
      console.error("Error updating player:", err);
      alert("Failed to update player information");
    }
  };

  const handleDeletePlayer = async (id) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        const { error } = await supabaseBrowser
          .from("profiles")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setPlayers(players.filter((player) => player.id !== id));
      } catch (err) {
        console.error("Error deleting player:", err);
        alert("Failed to delete player");
      }
    }
  };

  // Filter players based on search term
  const filteredPlayers = players.filter(
    (player) =>
      player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.preferred_position
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground p-3 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Players</h1>
      </div>

      {/* Pass filter‐state + handlers down into PlayerSearch */}
      <PlayerSearch
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40 sm:h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <PlayerStatsSummary players={players} />
          <PlayerTable
            players={filteredPlayers}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentUser={currentUser}
            onEdit={openPlayerModal}
            onDelete={handleDeletePlayer}
          />
        </>
      )}

      <PlayerEditModal
        player={currentPlayer}
        isOpen={isModalOpen}
        onClose={closePlayerModal}
        onSubmit={handleUpdatePlayer}
      />
    </div>
  );
}

export default PlayersPage;
