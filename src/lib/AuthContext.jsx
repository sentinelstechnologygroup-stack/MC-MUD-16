import {createContext,useContext} from 'react';
const AuthContext=createContext(null);
const publicSession={user:null,isAuthenticated:false,isLoadingAuth:false,isLoadingPublicSettings:false,authError:null,authChecked:true,appPublicSettings:null,logout:()=>{},navigateToLogin:()=>{},checkUserAuth:async()=>{},checkAppState:async()=>{}};
export function AuthProvider({children}){return <AuthContext.Provider value={publicSession}>{children}</AuthContext.Provider>;}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within an AuthProvider');return context;}
