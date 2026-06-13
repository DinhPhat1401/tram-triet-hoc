/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LessonContent {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Station {
  id: number;
  title: string;
  description: string;
  iconName: string; // references lucide icon name matching
  introduction: string;
  lessons: LessonContent[];
  questions: Question[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: string;
  summary: string;
  keyQuote: string;
  coverImage: string;
  category: "Marxist-Leninist" | "Classical Philosophy" | "Secondary Sources";
}

export interface Comment {
  id: string;
  author: string;
  avatarColor: string;
  avatarUrl?: string; // New field for user uploaded avatar
  content: string;
  timestamp: string;
  authorUid?: string | null;
}

export interface DiscussionPost {
  id: string;
  author: string;
  avatarColor: string;
  avatarUrl?: string; // New field for user uploaded avatar
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  replies: Comment[];
  category: string;
  authorUid?: string | null;
}

export interface UserProgress {
  currentStationId: number;
  completedLessons: string[]; // lesson ids
  quizScores: { [stationId: number]: number }; // stationId -> score
  completedQuizzes: number[]; // stationIds
  savedQuotes: string[];
  readBooks: string[];
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  progress?: UserProgress;
  bestScores?: {
    flappy?: number;
    memory?: number;
    penalty?: number;
  };
}
