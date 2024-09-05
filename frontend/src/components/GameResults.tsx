import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
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

interface GameResultsProps {
  userId: string;
}

const GameResults: React.FC<GameResultsProps> = ({ userId }) => {
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'game_results'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const results: GameResult[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          results.push({
            timestamp: data.timestamp.toDate(),
            min_response_time: data.min_response_time,
            max_response_time: data.max_response_time,
            avg_response_time: data.avg_response_time,
            score: data.score
          });
        });
        setGameResults(results);
      } catch (err) {
        console.error("Error fetching game results:", err);
        setError("Failed to fetch game results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameResults();
  }, [userId]);

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
            <CardTitle>Recent Game Results</CardTitle>
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
                {(gameResults.length > 0 ? gameResults : placeholderData).map((result, index) => (
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
              <LineChart data={gameResults.length > 0 ? [...gameResults].reverse() : placeholderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString()} 
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