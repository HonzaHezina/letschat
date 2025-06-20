# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables for Next.js build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Copy package.json and lock file
# Assuming package-lock.json is used, adjust if using yarn.lock or pnpm-lock.yaml
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
# The build command might need access to NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# if they are used during build time (e.g. static generation with data fetching).
# For this app, they are primarily used client-side, but it's good practice if they were needed.
# ARG NEXT_PUBLIC_SUPABASE_URL
# ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from the builder stage
# Includes .next/static, public, package.json, next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs
# If you have a standalone output build (output: "standalone" in next.config.mjs),
# you'd copy /app/.next/standalone and /app/.next/static instead.
# For now, assuming default build output.

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# (This is handled by the default build if not using `output: "standalone"`)

# Change ownership of .next to the new user, if not already done by --chown
# RUN chown -R nextjs:nodejs .next

# Switch to the non-root user
USER nextjs

# Expose port 3000 (Next.js default)
# Hugging Face Spaces might require specific port (e.g. 7860) or handle mapping.
# If HF requires 7860, you could change this and the CMD.
EXPOSE 3000

# Set the hostname to localhost to match common expectations.
ENV HOSTNAME "0.0.0.0"
# ENV PORT 3000 (Next.js will use this by default if EXPOSE is set, or can be set in package.json start script)

# Start the Next.js application
# The default "next start" command respects the PORT environment variable.
# If you need to force port 7860 for Hugging Face: CMD ["npm", "start", "--", "-p", "7860"]
CMD ["npm", "start"]
