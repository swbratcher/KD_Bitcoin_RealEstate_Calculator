# KD Bitcoin Real Estate Calculator

A comprehensive, privacy-focused calculator for analyzing Bitcoin investment strategies alongside real estate refinancing decisions. This tool helps users model scenarios where Bitcoin holdings are used to optimize mortgage strategies.

## 🎯 What This Tool Does

**For Property Owners**: Model how Bitcoin investments could affect your refinancing strategy, including cash-out refinancing and HELOC scenarios. Calculate optimal payoff timing and risk assessment.

**For Bitcoin Holders**: Analyze how real estate leverage can be combined with Bitcoin appreciation to build wealth while managing debt payoff timing.

**Core Analysis**:
- Month-by-month cash flow projections over 20-30 years
- Bitcoin performance modeling with multiple scenarios (Bullish, Realistic, Bearish)
- Loan payoff optimization triggers (2x debt value, retained BTC amount, etc.)
- Risk assessment including market drawdown scenarios
- Property appreciation alongside Bitcoin growth

## 🔒 Privacy & Security First

- **100% Client-Side**: All calculations run in your browser
- **No Data Collection**: Your financial information never leaves your device
- **No Analytics**: No tracking, cookies, or data transmission
- **Open Source**: Full transparency with MIT license
- **Future-Proof**: Works offline, includes Bitcoin price fallback system

## 🚀 Quick Start

### For Users

1. **Visit the Calculator**: Deploy to any static hosting or run locally
2. **Enter Property Details**: Current value, mortgage balance, monthly payment
3. **Choose Loan Strategy**: Cash-out refinance or HELOC
4. **Set Bitcoin Parameters**: Investment amount and growth scenario
5. **Analyze Results**: View projections, charts, and risk assessments

### Current Bitcoin Price

The tool automatically fetches live Bitcoin prices from CoinGecko API. If the API is unavailable, it gracefully falls back to a manual input field pre-populated with $100,000 that you can adjust.

## 🛠 For Developers

### Getting Started

```bash
# Clone and install
git clone <repository-url>
cd KD_Bitcoin_RealEstate_Calc
npm install

# Development
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build for production (exports to /out)
npm run test         # Run test suite
npm run lint         # Lint code
```

### Technology Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **Language**: TypeScript with strict type safety
- **UI**: React 18 + Tailwind CSS
- **Charts**: Recharts for data visualization
- **API**: CoinGecko integration with fallback
- **Testing**: Jest + React Testing Library
- **License**: MIT

### Key Architecture Principles

#### 1. **Privacy by Design**
- All calculations are client-side only
- No external data transmission of user inputs
- API calls only for Bitcoin price (optional)
- No analytics or tracking

#### 2. **User-Centric Development**
- Prioritize accuracy and usefulness over complexity
- Graceful degradation when external services fail
- Mobile-responsive design
- Instant feedback and live calculations

#### 3. **Reliability & Future-Proofing**
- Bitcoin price fallback system for API outages
- Static deployment compatible (no server required)
- Progressive enhancement approach
- Comprehensive error handling

### Core Components (Don't Break These!)

#### Critical Calculation Engines
```
lib/calculations/
├── comprehensive-amortization.ts    # 🔥 CORE: Monthly projections
├── enhanced-bitcoin-performance.ts  # 🔥 CORE: Bitcoin modeling
├── mortgage.ts                      # Loan calculations
└── bitcoin.ts                       # Price scenarios
```

#### Essential UI Components
```
components/
├── CalculatorForm.tsx              # 🔥 CORE: Input collection
├── AmortizationResults.tsx         # Results display
├── AmortizationChart.tsx           # Data visualization
├── KrigerDanesHeader.tsx           # Clean header
└── KrigerDanesFooter.tsx           # Legal disclaimers
```

### Development Guidelines

#### ✅ Safe Changes
- UI improvements and styling
- Additional Bitcoin price scenarios
- Enhanced chart visualizations
- New input validation
- Performance optimizations
- Documentation updates

#### ⚠️ Requires Care
- Calculation logic modifications
- Data flow between components
- Bitcoin price fetching system
- Form state management
- Type definitions

#### 🚫 Don't Break
- Privacy guarantees (client-side only)
- Bitcoin price fallback system
- Core calculation accuracy
- Static deployment compatibility
- MIT license compliance
- Professional disclaimers

### Code Quality Standards

1. **Type Safety**: All components must be fully typed
2. **Test Coverage**: Add tests for calculation logic changes
3. **Error Handling**: Graceful degradation for all external dependencies
4. **Performance**: Calculations should be responsive (<100ms for UI updates)
5. **Privacy**: Never transmit user financial data externally

## 📊 Features

### Bitcoin Performance Modeling
- **Multiple Scenarios**: Bullish (60%→15%), Realistic, Bearish, Custom
- **Cycle Awareness**: Accounts for Bitcoin halving cycles
- **Diminishing Returns**: Models performance degradation over time
- **Risk Management**: Maximum drawdown scenarios (30-60%)

### Loan Strategy Analysis
- **Cash-Out Refinance**: Complete mortgage restructuring
- **HELOC Options**: Home equity lines of credit
- **Payoff Optimization**: Smart trigger points for debt elimination
- **Cash Flow Projections**: Month-by-month analysis

### Risk Assessment
- **Market Stress Testing**: Various Bitcoin crash scenarios
- **Sustainability Analysis**: Long-term holding viability
- **Payoff Probability**: Data-driven success metrics
- **Retained Bitcoin**: Shows remaining holdings after payoff

## 🔧 Deployment

### Static Deployment (Recommended)
```bash
npm run build
# Deploy /out directory to any static host
# Works with: GitHub Pages, Netlify, Vercel, CDN, cPanel
```

### WordPress Integration
The tool is designed to be deployed as a subdirectory alongside WordPress:
```
your-domain.com/
├── wordpress-files/
└── bitcoin_realestate_calculator/  # Deploy /out contents here
```

## 📝 License & Legal

### Open Source License
- **MIT License**: Free for commercial and personal use
- **Attribution Required**: Credit Kriger Danes LLC in derivative works
- **Full License**: See [LICENSE](./LICENSE) file

### Professional Disclaimers
- Educational and informational purposes only
- Not financial, investment, tax, or legal advice
- Users must consult qualified professionals
- Investments carry significant risks including loss of principal

## 🤝 Contributing

We welcome contributions that maintain our core principles:

### Priority Order
1. **User Privacy & Security**: Never compromise client-side architecture
2. **Calculation Accuracy**: Ensure financial projections are reliable
3. **User Experience**: Intuitive, responsive, helpful
4. **Developer Experience**: Clear code, good documentation
5. **Feature Additions**: New capabilities that add value

### Contribution Process
1. **Read Architecture**: Understand the system before changing it
2. **Check Tests**: Ensure existing functionality isn't broken
3. **Add Tests**: Cover new calculation logic with tests
4. **Update Docs**: Keep documentation current
5. **Privacy Review**: Verify no data leakage in changes

### What We're Looking For
- Enhanced Bitcoin modeling scenarios
- Improved risk assessment tools
- Better data visualizations
- Mobile UX improvements
- Performance optimizations
- Documentation improvements

### What We Won't Accept
- Analytics or tracking additions
- External data transmission of user inputs
- Server-side calculation requirements
- Breaking changes to core calculation engines
- License violations or attribution removal

## 📞 Support

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Security**: Private disclosure for security-related issues

## 🎯 Development Roadmap

### Current Status: Production Ready ✅
- Full feature implementation complete
- Bitcoin price fallback system
- Professional legal disclaimers
- MIT license compliance
- Clean UI for public use

### Future Enhancements
- Additional loan scenarios (VA, FHA, etc.)
- Enhanced visualization options
- Export capabilities (PDF reports)
- Historical backtesting features
- Advanced risk modeling

---

**Built with privacy, accuracy, and user empowerment in mind.**

*For questions about the tool's financial concepts, consult with qualified financial professionals. For technical questions, see our documentation or open an issue.*