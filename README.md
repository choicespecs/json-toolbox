npm run dev

npm run dev -- --port 3000

export default defineConfig({
  server: {
    port: 3000,
  },
});

npm run deploy

stubborn deploy
git checkout gh-pages
echo "redeploy $(date)" > .redeploy
git add .redeploy
git commit -m "Force GitHub Pages redeploy"
git push origin gh-pages
git checkout main