import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  slug: string;
  storyline: string;
  imdbRating: number;
  releaseDate: Date;
  genres: string[];
  language: string;
  runtime: string;
  qualityType: string;
  availableQualities: string[];
  type: 'movie' | 'series';
  posterUrl: string;
  screenshots: string[];
  downloadLinks: Array<{
    title: string;
    size: string;
    url: string;
  }>;
  seasons: Array<{
    seasonNumber: number;
    episodes: Array<{
      episodeNumber: number;
      title: string;
      downloadLinks: Array<{
        title: string;
        size: string;
        url: string;
      }>;
    }>;
  }>;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    storyline: {
      type: String,
      required: true,
    },
    imdbRating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      required: true,
    },
    runtime: {
      type: String,
      required: true,
    },
    qualityType: {
      type: String,
      required: true,
    },
    availableQualities: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      enum: ['movie', 'series'],
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    screenshots: {
      type: [String],
      default: [],
    },
    downloadLinks: {
      type: [
        {
          title: String,
          size: String,
          url: String,
        },
      ],
      default: [],
    },
    seasons: {
      type: [
        {
          seasonNumber: Number,
          episodes: [
            {
              episodeNumber: Number,
              title: String,
              downloadLinks: [
                {
                  title: String,
                  size: String,
                  url: String,
                },
              ],
            },
          ],
        },
      ],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
