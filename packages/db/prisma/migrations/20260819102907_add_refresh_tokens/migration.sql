-- RenameForeignKey
ALTER TABLE "refresh_tokens" RENAME CONSTRAINT "refresh_tokens_userId_idx_fkey" TO "refresh_tokens_userId_fkey";