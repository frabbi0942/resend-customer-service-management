"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, UserCheck, UserX, Trash2, Users } from "lucide-react";

interface TeamMember {
  clerkUserId: string;
  isActive: boolean;
  createdAt: string;
}

export default function TeamPage() {
  const { user } = useUser();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    const res = await fetch("/api/team");
    if (res.ok) {
      setMembers(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const addMember = async () => {
    if (!newUserId.trim()) return;
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId: newUserId }),
    });
    setNewUserId("");
    setDialogOpen(false);
    await fetchMembers();
  };

  const addSelf = async () => {
    if (!user) return;
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId: user.id }),
    });
    await fetchMembers();
  };

  const toggleActive = async (clerkUserId: string, isActive: boolean) => {
    await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId, isActive: !isActive }),
    });
    await fetchMembers();
  };

  const removeMember = async (clerkUserId: string) => {
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkUserId }),
    });
    await fetchMembers();
  };

  const isSelfInTeam = members.some(
    (m) => m.clerkUserId === user?.id
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team</h1>
        <div className="flex gap-2">
          {!isSelfInTeam && user && (
            <Button variant="outline" size="sm" onClick={addSelf}>
              <UserCheck className="mr-2 h-4 w-4" />
              Add Myself
            </Button>
          )}
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage team members who handle support tickets. Only active members
            receive auto-assigned tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading...
            </p>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No team members yet. Add yourself or other Clerk users to start
                receiving ticket assignments.
              </p>
              {user && (
                <Button onClick={addSelf}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Add Myself as Team Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.clerkUserId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.clerkUserId === user?.id ? (
                          user?.firstName?.charAt(0) || "U"
                        ) : (
                          "U"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.clerkUserId === user?.id
                          ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "You"
                          : `User ${member.clerkUserId.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {member.clerkUserId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.isActive ? "default" : "secondary"}
                      className={
                        member.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : ""
                      }
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleActive(member.clerkUserId, member.isActive)
                      }
                    >
                      {member.isActive ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.clerkUserId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Clerk User ID</label>
              <Input
                placeholder="user_2abc123..."
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find user IDs in your Clerk Dashboard under Users.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addMember} disabled={!newUserId.trim()}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
