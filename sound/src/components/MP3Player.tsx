"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Upload, Play, Pause } from 'lucide-react'
import { Slider } from "@/components/ui/slider"

interface Song {
  name: string;
  src: string;
}

interface Message {
  text: string;
  type: 'error' | 'success';
}

const MP3Player: React.FC = () => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [message, setMessage] = useState<Message | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const preloadedSongs: Song[] = [
    { name: 'Song 1', src: '/preloaded-songs/song1.mp3' },
    { name: 'Song 2', src: '/preloaded-songs/song2.mp3' },
    { name: 'Song 3', src: '/preloaded-songs/song3.mp3' },
  ];

  useEffect(() => {
    setPlaylist(preloadedSongs);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      audioRef.current.playbackRate = speed;
    }
  }, [isPlaying, currentSongIndex, speed]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const newSong: Song = { name: file.name, src: URL.createObjectURL(file) };
      setPlaylist([...playlist, newSong]);
      setCurrentSongIndex(playlist.length);
      setIsPlaying(false);
    }
  };

  const handlePreloadedSongChange = (value: string) => {
    const songIndex = playlist.findIndex(song => song.src.includes(value));
    if (songIndex !== -1) {
      setCurrentSongIndex(songIndex);
      setIsPlaying(false);
    }
  };

  const handleUpload = async () => {
    if (currentSongIndex === -1) {
      setMessage({ text: 'Please select a song to upload.', type: 'error' });
      return;
    }

    const currentSong = playlist[currentSongIndex];
    const formData = new FormData();
    formData.append('file', await fetch(currentSong.src).then(r => r.blob()), currentSong.name);

    try {
      // Replace with your Pico's IP address
      const picoUrl = 'http://192.168.1.100:80/upload';
      const response = await fetch(picoUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage({ text: 'File uploaded successfully to Pico', type: 'success' });
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.error || 'Failed to upload song to Pico', type: 'error' });
      }
    } catch (error) {
      console.error('Error uploading to Pico:', error);
      setMessage({ 
        text: `An error occurred while uploading the song to Pico: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (newValue: number[]) => {
    const [newTime] = newValue;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleSpeedChange = (newValue: number[]) => {
    const [newSpeed] = newValue;
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            <div className="flex items-center justify-center gap-2">
              <Music className="h-8 w-8" />
              MP3 Player
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="mp3" className="text-sm font-medium block mb-2">
                Upload MP3
              </label>
              <Input id="mp3" type="file" accept=".mp3" onChange={handleFileChange} />
            </div>
            
            <div>
              <label htmlFor="preloaded" className="text-sm font-medium block mb-2">
                Select Preloaded Song
              </label>
              <Select onValueChange={handlePreloadedSongChange}>
                <SelectTrigger id="preloaded">
                  <SelectValue placeholder="Choose a song" />
                </SelectTrigger>
                <SelectContent>
                  {preloadedSongs.map((song) => (
                    <SelectItem key={song.src} value={song.src}>
                      {song.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {currentSongIndex !== -1 && (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={playlist[currentSongIndex].src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
              />
              <div className="text-center font-medium text-lg">
                {playlist[currentSongIndex].name}
              </div>
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={duration}
                  step={0.1}
                  value={[progress]}
                  onValueChange={handleProgressChange}
                />
                <div className="flex justify-between text-sm">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Button size="icon" variant="outline" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
              </div>
              <div className="space-y-2">
                <label htmlFor="speed" className="text-sm font-medium block">
                  Playback Speed: {speed.toFixed(1)}x
                </label>
                <Slider
                  id="speed"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[speed]}
                  onValueChange={handleSpeedChange}
                />
              </div>
            </div>
          )}
          
          <Button onClick={handleUpload} className="w-full py-6 text-lg">
            <Upload className="mr-2 h-6 w-6" /> Upload to Pico
          </Button>
          
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MP3Player;