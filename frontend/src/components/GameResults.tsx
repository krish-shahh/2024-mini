import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GameResult {
  timestamp: Date;
  min_response_time: number;
  max_response_time: number;
  avg_response_time: number;
  score: number;
}

const GameResults: React.FC = () => {
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
        setGameResults([]);
        setError("User not authenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchGameResults = async () => {
      if (!userEmail) return;

      setLoading(true);
      setError(null);
      try {
        console.log("Fetching data for email:", userEmail);
        const docRef = doc(db, 'game_results', userEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Raw Firestore data:", data);

          const results: GameResult[] = Object.entries(data).map(([key, value]) => ({
            timestamp: value.timestamp.toDate(),
            min_response_time: value.min_response_time,
            max_response_time: value.max_response_time,
            avg_response_time: value.avg_response_time,
            score: value.score
          }));

          console.log("Processed results:", results);
          setGameResults(results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10));
        } else {
          console.log("No document found for email:", userEmail);
          setGameResults([]);
        }
      } catch (err) {
        console.error("Error fetching game results:", err);
        if (err instanceof FirebaseError) {
          setError(`Firebase error: ${err.message}`);
        } else if (err instanceof Error) {
          setError(`Error fetching game results: ${err.message}`);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGameResults();
  }, [userEmail]);

  if (!userEmail) {
    return <div>Please sign in to view your game results.</div>;
  }

  if (loading) {
    return <div>Loading game results...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const placeholderData = Array(5).fill({
    timestamp: new Date(),
    min_response_time: 0,
    max_response_time: 0,
    avg_response_time: 0,
    score: 0
  });

  const dataToDisplay = gameResults.length > 0 ? gameResults : placeholderData;

  console.log("Data to display:", dataToDisplay);

  return (
    <div className="relative">
      {gameResults.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-700">No data available yet</div>
        </div>
      )}
      <div className={gameResults.length === 0 ? 'filter blur-sm' : ''}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Recent Game Results for {userEmail}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Min Response Time (ms)</TableHead>
                  <TableHead>Max Response Time (ms)</TableHead>
                  <TableHead>Avg Response Time (ms)</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataToDisplay.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.timestamp.toLocaleString()}</TableCell>
                    <TableCell>{result.min_response_time}</TableCell>
                    <TableCell>{result.max_response_time}</TableCell>
                    <TableCell>{result.avg_response_time.toFixed(2)}</TableCell>
                    <TableCell>{(result.score * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataToDisplay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => new Date(tick).toLocaleString()} 
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  formatter={(value, name) => [
                    name === 'score' ? `${(Number(value) * 100).toFixed(2)}%` : `${Number(value).toFixed(2)} ms`,
                    name === 'score' ? 'Score' : 'Avg Response Time'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avg_response_time" 
                  stroke="#8884d8" 
                  name="Avg Response Time" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#82ca9d" 
                  name="Score" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameResults;