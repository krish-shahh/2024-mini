'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import SignIn from '@/components/SignIn';
import GameResults from '@/components/GameResults';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define team members
const teamMembers = [
  { name: "Krish", email: "kshah26@bu.edu" },
  { name: "Benjamin", email: "bgilb33@bu.edu" },
];

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
      }, 60 * 60 * 1000); // 1 hour
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);

    return () => {
      unsubscribe();
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keypress', resetInactivityTimer);
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const handleContactUs = () => {
    const emailAddresses = teamMembers.map(member => member.email).join(',');
    const subject = encodeURIComponent('Inquiry about Response Time Game Project');
    const body = encodeURIComponent('Hello Team,\n\nI have a question about your Response Time Game project:\n\n');
    window.location.href = `mailto:${emailAddresses}?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl">Response Time Game Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="flex justify-between items-center">
              <p className="text-lg">Welcome, {user.displayName}!</p>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <SignIn />
          )}
        </CardContent>
      </Card>

      {user && (
        <Tabs defaultValue="results" className="mb-4">
          <TabsList>
            <TabsTrigger value="results">Game Results</TabsTrigger>
            <TabsTrigger value="overview">Project Overview</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          <TabsContent value="results">
            <GameResults userId={user.uid} />
          </TabsContent>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Real-time response game using MicroPython</li>
                  <li>Firebase authentication and Firestore database integration</li>
                  <li>Next.js frontend with TypeScript and Tailwind CSS</li>
                  <li>Responsive design with mobile support</li>
                  <li>Data visualization using Recharts</li>
                  <li>Automated deployment via Vercel</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Connect the MicroPython device to your computer.</li>
                  <li>Run the game script on the device.</li>
                  <li>When the LED lights up, press the button as quickly as possible.</li>
                  <li>Your response times will be recorded and uploaded to the cloud.</li>
                  <li>View your results and performance trends on this dashboard.</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => window.open('https://github.com/krish-shahh/2024-mini', '_blank')}>
              GitHub Repo
            </Button>
            <Button variant="outline" onClick={handleContactUs}>
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;