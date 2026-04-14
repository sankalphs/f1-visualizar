# F1 Visualizer

[![Live Demo](https://img.shields.io/badge/Live%20Demo-f1.sankalphs.dev-blue?style=for-the-badge)](https://f1.sankalphs.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-f1--visualizar.vercel.app-black?style=for-the-badge&logo=vercel)](https://f1-visualizar.vercel.app/)

A modern, real-time Formula 1 data visualization dashboard built with Next.js and the [OpenF1 API](https://openf1.org/).


## Features

- **Real-time Race Data**: Live timing, positions, and lap data
- **Interactive Telemetry**: Speed, throttle, brake, and steering visualization
- **Strategy Analysis**: Pit stops, tire compounds, and stint analysis
- **Track Maps**: Live position tracking on circuit maps
- **Weather Monitoring**: Track and air temperature, humidity, wind conditions
- **Race Control**: Live flags, incidents, and steward decisions
- **Team Radio**: Driver communications and messages
- **Sector Times**: Detailed sector and mini-sector analysis
- **Overtake Tracking**: Real-time overtake and position change data
- **Dark/Light Mode**: Automatic theme switching with neo-brutalist design

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/f1-visualizar.git
cd f1-visualizar
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Data Source

This project uses the [OpenF1 API](https://openf1.org/), a free and open-source API providing real-time and historical Formula 1 data. The API is community-maintained and not affiliated with Formula 1 or FOM.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── drivers/      # Driver listings and details
│   ├── laps/         # Lap time analysis
│   ├── positions/    # Live position tracking
│   ├── telemetry/    # Telemetry visualization
│   ├── weather/      # Weather data
│   └── ...
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   ├── layout/       # Layout components (Nav, Sidebar)
│   ├── providers/    # Context providers
│   ├── ui/           # UI primitives
│   └── ...
├── lib/              # Utilities and API clients
│   ├── api/          # API client for OpenF1
│   └── utils.ts      # Utility functions
└── __tests__/        # Test files
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This project is not affiliated with, associated with, or endorsed by Formula 1, FOM, or any F1 teams. All F1-related trademarks and data are property of their respective owners. The data is provided by the OpenF1 API for educational and personal use.

## Acknowledgments

- [OpenF1](https://openf1.org/) for providing the free F1 data API
- [Next.js](https://nextjs.org/) team for the excellent framework
- All contributors and supporters of this project

---

**Live Demo**: [f1.sankalphs.dev](https://f1.sankalphs.dev/) | [f1-visualizar.vercel.app](https://f1-visualizar.vercel.app/)
