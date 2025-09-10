# Development Workflow

## Branch Strategy

```
main (production) ← staging ← dev
```

- **`dev`**: Local development and feature work
- **`staging`**: Local testing and integration 
- **`main`**: Production deployment (auto-deploys to Vercel)

## Local Development

### 1. Setup
```bash
# Clone and install
git clone <your-repo>
cd <your-project>
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your actual values in .env.local
```

### 2. Development Workflow

#### Working on new features:
```bash
# Switch to dev branch
git checkout dev
git pull origin dev

# Create feature branch (optional)
git checkout -b feature/your-feature-name

# Start development server
npm run dev

# Make changes, test locally
# Commit and push to dev
git add .
git commit -m "Add new feature"
git push origin dev  # or feature branch
```

#### Testing integration:
```bash
# Merge dev changes to staging
git checkout staging
git pull origin staging
git merge dev

# Test locally
npm run dev

# Push staging if tests pass
git push origin staging
```

#### Production deployment:
```bash
# Merge staging to main (triggers auto-deployment)
git checkout main
git pull origin main
git merge staging
git push origin main

# 🚀 This automatically deploys to production via GitHub Actions + Vercel
```

## Local Supabase Functions

For local function development:

```bash
# Start Supabase locally (optional)
supabase start

# Or test against production Supabase
# (functions will use your .env.local variables)
```

## Environment Variables

Create `.env.local` with:
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## CI/CD Pipeline

- ✅ **All branches**: Run tests on push/PR
- ✅ **Main only**: Deploy to production (Supabase functions + Vercel)
- ✅ **Dev/Staging**: Local development only (no deployment)

This keeps costs low while maintaining a proper development workflow!