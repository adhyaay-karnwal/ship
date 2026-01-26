"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, RepoIcon, GitBranchIcon, SearchIcon } from "@/components/ui/icons";

interface Repo {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  description: string | null;
  language: string | null;
  updatedAt: string;
}

interface Branch {
  name: string;
  protected: boolean;
}

interface RepoSelectorProps {
  githubToken: string;
  onSelect: (repo: Repo, branch: string) => void;
}

export function RepoSelector({ githubToken, onSelect }: RepoSelectorProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  useEffect(() => {
    async function fetchRepos() {
      setIsLoadingRepos(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const response = await fetch(
          `${apiUrl}/repos?githubToken=${encodeURIComponent(githubToken)}`
        );
        if (response.ok) {
          const data = await response.json();
          setRepos(data.repos);
        }
      } catch (error) {
        console.error("Failed to fetch repos:", error);
      } finally {
        setIsLoadingRepos(false);
      }
    }
    fetchRepos();
  }, [githubToken]);

  useEffect(() => {
    if (!selectedRepo) {
      setBranches([]);
      return;
    }

    async function fetchBranches() {
      if (!selectedRepo) return;
      setIsLoadingBranches(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const [owner, repo] = selectedRepo.fullName.split("/");
        const response = await fetch(
          `${apiUrl}/repos/${owner}/${repo}/branches?githubToken=${encodeURIComponent(githubToken)}`
        );
        if (response.ok) {
          const data = await response.json();
          setBranches(data.branches);
          setSelectedBranch(selectedRepo.defaultBranch);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setIsLoadingBranches(false);
      }
    }
    fetchBranches();
  }, [selectedRepo, githubToken]);

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (selectedRepo && selectedBranch) {
      onSelect(selectedRepo, selectedBranch);
    }
  };

  return (
    <div className="space-y-6">
      {/* Repository Search */}
      <div>
        <label className="block text-sm font-medium mb-2">Repository</label>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search repositories..."
        />
      </div>

      {/* Repository List */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
        {isLoadingRepos ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No repositories found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors",
                  selectedRepo?.id === repo.id
                    ? "bg-accent"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <RepoIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">
                    {repo.fullName}
                  </span>
                  {repo.isPrivate && (
                    <Badge variant="secondary" className="text-[10px]">
                      Private
                    </Badge>
                  )}
                </div>
                {repo.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {repo.description}
                  </p>
                )}
                {repo.language && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {repo.language}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Branch Selector */}
      {selectedRepo && (
        <div>
          <label className="block text-sm font-medium mb-2">Branch</label>
          {isLoadingBranches ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              Loading branches...
            </div>
          ) : (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {branches.map((branch) => (
                <option key={branch.name} value={branch.name}>
                  {branch.name}
                  {branch.protected && " (protected)"}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedRepo || !selectedBranch}
        className="w-full"
      >
        Start Session
      </Button>
    </div>
  );
}

// Inline dropdown variants for the main page

interface RepoDropdownProps {
  repos: Repo[];
  selectedRepo: Repo | null;
  onSelect: (repo: Repo) => void;
  isLoading?: boolean;
}

export function RepoDropdown({ repos, selectedRepo, onSelect, isLoading }: RepoDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <RepoIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">
            {isLoading ? "Loading..." : selectedRepo?.name || "Select repo"}
          </span>
        </div>
        <ChevronDownIcon className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 max-h-80 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repos..."
                className="pl-8 h-8"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredRepos.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No repos found
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => {
                    onSelect(repo);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2",
                    selectedRepo?.id === repo.id && "bg-accent"
                  )}
                >
                  <RepoIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{repo.fullName}</span>
                  {repo.isPrivate && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Private
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface BranchDropdownProps {
  branches: Branch[];
  selectedBranch: string;
  onSelect: (branch: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function BranchDropdown({ branches, selectedBranch, onSelect, isLoading, disabled }: BranchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || disabled}
        className="min-w-[140px] justify-between"
      >
        <div className="flex items-center gap-2">
          <GitBranchIcon className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">
            {isLoading ? "Loading..." : selectedBranch || "Select branch"}
          </span>
        </div>
        <ChevronDownIcon className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 max-h-60 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50">
          <div className="max-h-60 overflow-y-auto">
            {branches.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No branches found
              </div>
            ) : (
              branches.map((branch) => (
                <button
                  key={branch.name}
                  onClick={() => {
                    onSelect(branch.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2",
                    selectedBranch === branch.name && "bg-accent"
                  )}
                >
                  <GitBranchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{branch.name}</span>
                  {branch.protected && (
                    <Badge variant="outline" className="text-[10px] text-warning border-warning/50 shrink-0">
                      Protected
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
