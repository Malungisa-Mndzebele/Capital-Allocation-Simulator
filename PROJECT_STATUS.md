# Capital Allocation Simulator - Project Status

**Last Updated:** February 10, 2026

## Project Overview
A realistic financial simulation game that teaches capital allocation, investment strategies, and wealth building through gameplay.

## Live Deployment
- **Frontend:** https://khasinogaming.com/world/
- **Backend:** https://capital-allocation-backend.onrender.com
- **Status:** ✓ Live and operational
- **Latest Deploy:** Retirement accounts feature (auto-deploying)

## Core Features Implemented

### Financial Systems
- Career progression with multiple job tiers
- Investment system (stocks, bonds, real estate)
- Business ownership and management
- Loan system (student, personal, mortgage, business)
- Retirement accounts (401k, IRA, Roth IRA) - Latest addition
- Credit score system
- Tax simulation

### Game Mechanics
- Skill tree progression
- Achievement system
- Personality traits affecting gameplay
- Random events and opportunities
- Scenario mode
- Challenge mode
- Visual progression tracking
- Net worth charting

### Technical Stack
- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL
- **Frontend:** React, TypeScript, Vite
- **Deployment:** Render (auto-deploy from main branch)
- **Testing:** Vitest for both frontend and backend

## Recent Updates (Feb 10, 2026)

### Retirement Accounts Feature
- Three account types: 401(k), Traditional IRA, Roth IRA
- Employer matching for 401(k)
- Age-based contribution limits
- Early withdrawal penalties
- Tax advantages simulation
- Tutorial system
- Real-time notifications
- Comprehensive test coverage

### Files Added
- `backend/src/engine/systems/RetirementLogic.ts`
- `backend/src/engine/systems/RetirementLogic.test.ts`
- `backend/src/engine/systems/RetirementIntegration.test.ts`
- `frontend/src/components/RetirementDashboard.tsx`
- `frontend/src/components/RetirementActions.tsx`
- `frontend/src/components/RetirementNotifications.tsx`
- `frontend/src/components/RetirementTutorial.tsx`
- Test files for all components
- Vitest configurations

## Documentation

### Essential Docs (Kept)
- `README.md` - Project overview and setup
- `GAME_GUIDE.md` - Player guide
- `BACKEND_SETUP.md` - Backend configuration
- `CI_CD_SETUP.md` - Deployment guide
- `FINAL_AUDIT_REPORT.md` - Comprehensive audit
- `FUTURE_VISION.md` - Roadmap
- `RETIREMENT_DEPLOYMENT_STATUS.md` - Latest deployment info

### Test Scripts
- `test-live-deployment.ps1` - Full deployment test
- `test-full-game.ps1` - Complete game playthrough
- `test-full-game-playthrough.ps1` - Extended playthrough
- `test-api-simple.ps1` - Basic API tests

## Development Workflow

### Making Changes
1. Edit code in `backend/src/` or `frontend/src/`
2. Run tests locally
3. Commit and push to `main` branch
4. Render auto-deploys within 5-10 minutes

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Live deployment test
.\test-live-deployment.ps1
```

## Next Steps
1. Monitor retirement accounts deployment
2. Test retirement features in production
3. Gather user feedback
4. Plan next feature iteration

## Project Structure
```
Capital-Allocation-Simulator/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── engine/   # Game logic
│   │   └── server.ts # API endpoints
│   └── prisma/       # Database schema
├── frontend/         # React UI
│   ├── src/
│   │   ├── components/
│   │   └── App.tsx
├── .kiro/           # Kiro IDE specs
└── docs/            # Documentation
```

## Contact & Resources
- Repository: GitHub (private)
- Deployment: Render
- Database: PostgreSQL (Render managed)

---

**Note:** This is a living document. Update as features are added or changed.
