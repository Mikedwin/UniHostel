@echo off
echo Using npx to run Supabase commands (no installation needed)
echo.
echo Logging in to Supabase...
echo.

npx supabase login
echo.
echo Linking to project: fvkucgyqvuroxbrjdpkx
npx supabase link --project-ref fvkucgyqvuroxbrjdpkx
echo.
echo Deploying Edge Function...
npx supabase functions deploy api --project-ref fvkucgyqvuroxbrjdpkx
echo.
echo Done!
pause
