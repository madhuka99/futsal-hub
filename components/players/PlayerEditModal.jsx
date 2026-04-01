// PlayerEditModal.jsx
"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

export function PlayerEditModal({ player, isOpen, onClose, onSubmit }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isOpen) return null;

  const FormContent = () => (
    <form className="space-y-4 pb-5 md:pb-0" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="full_name">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={player?.full_name || ""}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="preferred_position"
        >
          Preferred Position
        </label>
        <select
          id="preferred_position"
          name="preferred_position"
          defaultValue={player?.preferred_position || ""}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select position</option>
          <option value="Forward">Forward</option>
          <option value="Midfielder">Midfielder</option>
          <option value="Defender">Defender</option>
          <option value="Goalkeeper">Goalkeeper</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue={player?.role || "player"}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="player">Player</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {player && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="matches_played"
              >
                Matches
              </label>
              <input
                id="matches_played"
                name="matches_played"
                type="number"
                defaultValue={player?.matches_played || 0}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="goals">
                Goals
              </label>
              <input
                id="goals"
                name="goals"
                type="number"
                defaultValue={player?.goals || 0}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="assists"
              >
                Assists
              </label>
              <input
                id="assists"
                name="assists"
                type="number"
                defaultValue={player?.assists || 0}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="mvp_count"
              >
                MVP Count
              </label>
              <input
                id="mvp_count"
                name="mvp_count"
                type="number"
                defaultValue={player?.mvp_count || 0}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wins">
                Wins
              </label>
              <input
                id="wins"
                name="wins"
                type="number"
                defaultValue={player?.wins || 0}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="losses"
              >
                Losses
              </label>
              <input
                id="losses"
                name="losses"
                type="number"
                defaultValue={player?.losses || 0}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {player ? "Update Player" : "Create Player"}
        </Button>
      </div>
    </form>
  );

  // Use Dialog for desktop
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {player ? "Edit Player" : "Create Player"}
            </DialogTitle>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Use Drawer for mobile
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{player ? "Edit Player" : "Create Player"}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <FormContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
