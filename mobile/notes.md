## 🎯 React Native Notes

### Chapter1 : Project SetUp

# Commit 1 - Project Setup

1. create expo app at mobile folder 

npx create-expo-app@latest mobile

2. install all dependencies 

npm install expo-router expo-constants axios @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @expo/vector-icons expo-secure-store amazon-cognito-identity-js

# Commit 2 - env and app.json

write new app.json

# Commit 3 - create folders 

1. create necessary folders :

mkdir -p mobile/src/store
mkdir -p mobile/src/api
mkdir -p mobile/src/services
mkdir -p mobile/src/screens
mkdir -p mobile/src/components
mkdir -p mobile/src/hooks
mkdir -p mobile/src/types
mkdir -p mobile/src/utils

# Commit 4 - Types folder

create index.ts at typpes folder. types of all functionalities matching the client and server side code. 

### Chapter2 : React Redux Setup

# Commit 5 - React Redux installation

1. install react redux related libraries 

npm install @reduxjs/toolkit react-redux

# Commit 6 - React Redux Setup

now we will move on with the redux setup. redux setup will be for all related files. 
I renamed the store folder to state folder. 

1. mobile/src/state/index.ts : the file has RootState and AppDispatch
2. mobile/src/state/hooks.ts : exports RootState and AppDispatch
3. mobile/src/state/slices/globalSlice.ts : has globalSlice , states , actions and reducers. 
4. mobile/src/state/api.ts : has all api endpoints.
the authentication related code is there as well but we will implement it later. 
all other apis as well we will implement step by step. 
5. mobile/src/providers/ReduxProvider.tsx : to wrap the application with a provider. 
6. mobile/app/_layout.tsx : change and wrap the application in redux provider. 


### Chapter 3 : Authentication 

# Commit 7 - Authentication setup (Services and installation)

lets install dependencies that work with react native. aws amplify does not directly 
work with react native but what works is Installing Cognito package (NOT aws-amplify): 

1. npm install amazon-cognito-identity-js
npx expo install @react-native-async-storage/async-storage
npm i expo-secure-store
2. src/services/authService.ts : create the authentication service. 

# Commit 8 - Authentication Part 2 (FrontEnd work ,Folder setup, signin nd signup complete)

1. first create (auth) folder at same leveel as (tabs) folder. 
this has signin , signup , confirm page and a seperate _layout.tsx file 
as well that defines the layouts of this foler. 

2. tabs folder has other tabs that user can access once the user has been
authenticated. the tabs are profile , project , wallet. this also has a layout 
defining how the tabs will look like. 

3. finally change main _layout.tsx in app folder to adjust to new tabs and pages

4. signup logic : signup logic had issues as of using name alias. code fixed to match signin 
with roles as well. 

### Chapter 4 : Core Functions

# Commit 9 - building homepage 

1. created 2 reusable components - loadingspinner and projectcard

# commit 10 - Frontend components - hompage rlated components

1. created components in home folder in components. these components will be used for the home page 

# commit 11 - Frontend components - hompage completed

1. in (tabs) folder we had index before (main homepage). replaced code there to have new page.

# Commit 12 - Frontend components - Projects List related components

1. npm install lucide-react-native
2. in projects folder create all components related to project listing

# Commit 13 - Frontend components - Project list page completed + ProjectCard bug fix

1. projectcard for shared use , was not showing project progress properly. now 
its working properly
2. the (tabs) for project listing is completed as well.

# Commit 14 - Frontend components - Project Details (slug) components

in this step we will be creating all necessary components for a project details page.
we created a components folder in src that has projectDetails folder.
this folder has all components related to the details of the project.

1. created related folders 

mkdir -p mobile/app/project
mkdir -p mobile/src/components/projectDetail

2. check files created.

# Commit 15 - Frontend Components - DonationModal with WebView

for donations , to keep payment pateway options easy we will be using a new donation modal
with webview that will complete functionalities related to sslcommerce. 

1. npx expo install react-native-webview
2. DonationModal.tsx in projectdetails folder in components of src

# Commit 16 - Frontend components - Project Details Main page + Components + PAYMENT WORKING

created main page for project details for last 2 commits where we crated project and donation
related components and modals. check project/[slug].tsx

the main challenge here was having webview with payment gateway. look at related code. 

# Commit 17 - Wallet - User Wallet

look at created code for a user's wallet. a user who donates to projects has his wallet working. 

# Commit 18 - Wallet - Creator Wallet (User wallet and Creator wallet seperated)

the wallet we created before worked for user olnly. 
Now wwe have seperated 2 componentss - creatorwallet , userwallet as 
seperate components. in tabs , we have a user based access to wallet. 

# Commit 19 - Push All Missing Screens from client side

Since we have looked at enough lessons till this point , i will be pushing all codes in a signle commit 