'use client';

import { Bell, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function Header() {
    return (
      <header className="flex items-center h-16 px-4 border-b bg-white fixed top-0 left-0 right-0 z-30 md:left-64">
        <div className="flex items-center flex-1 space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10 focus:outline-none"
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/default.png" alt="User" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            {/* <DropdownMenuContent className="w-56 bg-white border rounded shadow" align="end" forceMount>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent> */}
          </DropdownMenu>
        </div>
      </header>
    );
  }