# ARDOG

## About $ARDOG

ARDOG is the official site for the $ARDOG Solana memecoin (CA: `85YgaPBNug3zUNLgXn2PLR4WXywjarELBCiQLswYpump`).

$ARDOG is a community-owned memecoin with an innovative AR (Augmented Reality) component that lets users see a virtual dog in their real environment. Originally launched and quickly abandoned by a developer, it was revived by passionate community members who built this website and established a new community.

### Key Features:
- **Augmented Reality Experience**: Point your phone at a QR code to bring the AR dog into your world
- **100% Community-Owned**: Fully controlled by holders, not developers
- **0% Tax**: No buy/sell taxes
- **100% Liquidity Burnt**: Ensuring a fully decentralized token

Visit [thedogiseverywhere.com](https://thedogiseverywhere.com/) for more information and to experience $ARDOG in AR.

## Technical Information

This project is built using:
- Cloudflare Workers for deployment
- Vite for build tooling
- React + TypeScript for frontend development

### Development Instructions

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Run development server**:
   ```
   npm run dev
   ```

3. **Build for production**:
   ```
   npm run build
   ```

4. **Deploy to Cloudflare Workers**:
   ```
   npm run deploy
   ```

## ESLint Configuration

If you're contributing to this project, we recommend updating the ESLint configuration for better type checking:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    // For stricter rules, use:
    // ...tseslint.configs.strictTypeChecked,
    // For stylistic rules, add:
    // ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

For React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```