"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const result = await authApi.login(values);
      const role = result.data?.user?.role;
      if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
        setError("This account does not have administrator access.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <main className="outliers-login"><section className="outliers-login-story"><div className="outliers-login-brand"><img src="/logo.svg" alt="The Outliers Studio" /><div><strong>THE OUTLIERS STUDIO</strong><span>Operations portal</span></div></div><div className="outliers-login-message"><i><Sparkles /></i><p>Built for the people moving the business forward.</p><span>A focused operations space for inventory, orders, campaigns, and customer care.</span></div><div className="outliers-login-secure"><Check /> Secure access for The Outliers Studio team</div></section><section className="outliers-login-form-wrap"><div className="outliers-login-form"><div className="outliers-login-mobile-brand"><img src="/logo.svg" alt="The Outliers Studio" /> THE OUTLIERS STUDIO</div><header><p>Operations portal</p><h1>Welcome back</h1><span>Sign in with your administrator account to continue.</span></header><form onSubmit={submit}><label><span>Email address</span><Input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label><label><span>Password</span><Input name="password" type="password" placeholder="••••••••" autoComplete="current-password" required /></label><label className="outliers-remember"><input name="remember" type="checkbox" /> Remember me for 30 days</label>{error && <p role="alert" className="outliers-login-error">{error}</p>}<Button type="submit" disabled={pending}><LockKeyhole />{pending ? "Checking access…" : "Login"}{!pending && <ArrowRight />}</Button></form><footer>Restricted to The Outliers Studio administrators and operations staff.</footer></div></section></main>;
}
