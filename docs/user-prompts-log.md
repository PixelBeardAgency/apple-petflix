# User Prompts Log

This file contains a record of all user prompts during the Petflix implementation.

## Setup & Phase 1-2

1. "Can you create a full comprehensive plan from the @petflix-prd-2025-11-10.md and save it in the docs folder in a 'plan' sub-folder"

2. "Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself. To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos."

3. "Going forward, can you stop after each phase has been implemented, and only continue when I say. Put this into action after Phase 2 please."

4. "Before we move onto phase 3, can you help me with setting up the supabase project? I have created the project itself, but want help configuring it"

## Troubleshooting Phase 2

5. "@zsh (97-119)" - npm install error with vite-plugin-pwa version compatibility

6. "@zsh (120-129)" - npm install error with non-existent @radix-ui/react-badge package

7. "@zsh (151-183)" - PostCSS config error with ES module syntax

8. "In my brownser at http://localhost:5173/, you are suggesting I should be able to see the UI, however I can't see anything, just a blank white page."

9. "Uncaught SyntaxError: The requested module 'http://localhost:5173/src/services/auth.ts?t=1762942512110' doesn't provide an export named: 'SignUpData'"

10. "Uncaught SyntaxError: The requested module 'http://localhost:5173/node_modules/.vite/deps/@supabase_supabase-js.js?v=8e0ab36f' doesn't provide an export named: 'User'. Could you check all of the other possible ways this could fail that are similar to that please?"

11. "Profile is currently inaccessible, I can register and am signed in but can't logout. User has been created in the table. If this is expected at this stage, simply reply telling me that, and then we can move on."

12. "Can you please record every past prompt I've given you, and also record this prompt with all future prompts in a file in the docs folder please? Just the prompts in a numbered list."

## Phase 3 Start

13. "Excellent, I have verfied that everything works up to this point, we can continue with phase 3."

## Troubleshooting Phase 3

14. Screenshot showing duplicate debounce export error in utils.ts

15. Screenshot showing "NetworkError when attempting to fetch resource" and React DevTools errors

16. "The only thing I have done is add a youtube API key to the env file. I still have a supabase URL in there, and didn't change that. However, when I do npm run dev in the backend, it says the supabaseUrl is required. I think this is the problem, but I'm unsure why it's cropped up as I've not changed anything."

17. Screenshot showing "Failed to search videos" error with 500 status code

18. "When I click 'Share Video', I get an error message: new row violates row-level security policy for table 'videos'"

19. "Can I add a small task before we move onto phase 4 (but after we have got this stage tested successfully), which is to add a dark theme to the website with a toggle in the header. I'd like it to match the system if possible as default, but be overridden if the user engages with the toggles."

20. "I 100% do have a supabase service key in my backend env file, but it's weirdly the same as the anon key. I double checked on supabase and this is definitely correct."

21. "Can I request new keys here somehow? As they are 100% the same"

22. Screenshot showing Supabase API keys page with identical anon and service_role keys

23. "Okay I have created a new supabase project and updated it in my env files."

24. "Okay brilliant, I have done all of that, I have changed my email configurations too, so that the user doesn't have to confirm via email on registration, and have disabled secure email change as per your previous instruction earlier on in the project. I successfully created an account and signed in, searched for a video and shared it."

## Dark Mode Feature

25. "I don't think the dark mode switch works. My system is set to dark mode, however no matter how many times I press the theme switch, it doesn't go to a dark mode."

26. "It still doesn't work. The cream colour stays dominant, the only difference that happens when I press the dark mode toggle is that the words in the headers change colour (and look invisible until I hover over them). I have verified this on multiple browsers"

27. "The feed page is still cream, however if you think you will do this in the coming steps, tell me that but do not proceed with the next phase until I say so"

## Phase 4 Start

28. "Sure, let's go to phase 4"

29. "When does the follow button, comments section and notification bell get implemented?"

## Troubleshooting Phase 4

30. Screenshot showing 500 error: "Could not find a relationship between 'notifications' and 'profiles' in the schema cache"

31. Screenshot showing Supabase warning about destructive operation (DROP COLUMN) - "Is this expected?"

32. "The notifications bell is only on select pages (such as profile), is this not something we want to be accessible throughout the site?"

## Phase 5 Start

33. "okay great, let's progress"

34. "Can you implement those suggestions to fully integrate the playlists please? E.g Add an 'Add to Playlist' button on video detail pages, Add tags UI to playlist detail page, Create a moderation dashboard page for admins"

## Phase 6 Start

35. "no, let's go with the next phase!"

## Phase 7 Start

36. "Let's start phase 7, everything you've mentioned there that's not yet implemented I want implemented at some point in the future under the correct phase. Can you also implement any unit tests in the appropriate places?"

## Phase 8 Start

37. "Okay let's go with phase 8. I'd like to do all the testing at the end of the initial development, is the project set up for that to be the case? If not, could you make it so please"

## Phase 8 Troubleshooting

38. Error screenshot - Missing @radix-ui/react-popover package
39. Error screenshot - CastConnected icon doesn't exist in lucide-react

## Phase 9 Start

40. "That fixed it, thank you. Now, let's continue."

## Phase 10 Start

41. "Let's do phase 10 sure!"
