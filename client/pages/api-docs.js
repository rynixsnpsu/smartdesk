import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function APIDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const endpoints = [
    {
      category: "Authentication",
      color: "cyan",
      routes: [
        {
          method: "POST",
          path: "/login",
          description: "User login",
          body: { username: "string", password: "string" },
          response: { token: "string", user: "object" }
        },
        {
          method: "GET",
          path: "/logout",
          description: "User logout",
          response: { message: "string" }
        },
        {
          method: "GET",
          path: "/api/auth/me",
          description: "Get current user",
          auth: true,
          response: { user: "object" }
        }
      ]
    },
    {
      category: "Admin",
      color: "pink",
      routes: [
        {
          method: "GET",
          path: "/api/admin/analytics",
          description: "Get analytics data",
          auth: true,
          query: { category: "string (optional)" },
          response: { totalSubmissions: "number", categoryDistribution: "array", weeklyTrends: "array" }
        },
        {
          method: "GET",
          path: "/api/admin/insights",
          description: "Get AI insights",
          auth: true,
          response: { summary: "string", themes: "array", severityLeaderboard: "array" }
        }
      ]
    },
    {
      category: "Users",
      color: "green",
      routes: [
        {
          method: "GET",
          path: "/api/users",
          description: "Get all users",
          auth: true,
          response: { users: "array" }
        },
        {
          method: "POST",
          path: "/api/users",
          description: "Create user",
          auth: true,
          body: { username: "string", email: "string", password: "string", role: "string" },
          response: { user: "object" }
        },
        {
          method: "PUT",
          path: "/api/users/:id",
          description: "Update user",
          auth: true,
          body: { username: "string", email: "string", role: "string" },
          response: { user: "object" }
        },
        {
          method: "DELETE",
          path: "/api/users/:id",
          description: "Delete user",
          auth: true,
          response: { message: "string" }
        }
      ]
    },
    {
      category: "Academic",
      color: "blue",
      routes: [
        {
          method: "GET",
          path: "/api/departments",
          description: "Get all departments",
          auth: true,
          response: { departments: "array" }
        },
        {
          method: "POST",
          path: "/api/departments",
          description: "Create department",
          auth: true,
          body: { name: "string", code: "string", description: "string" },
          response: { department: "object" }
        },
        {
          method: "GET",
          path: "/api/courses",
          description: "Get all courses",
          auth: true,
          response: { courses: "array" }
        },
        {
          method: "POST",
          path: "/api/courses",
          description: "Create course",
          auth: true,
          body: { code: "string", name: "string", department: "string", credits: "number" },
          response: { course: "object" }
        },
        {
          method: "GET",
          path: "/api/enrollments",
          description: "Get all enrollments",
          auth: true,
          response: { enrollments: "array" }
        }
      ]
    },
    {
      category: "Student",
      color: "purple",
      routes: [
        {
          method: "GET",
          path: "/api/student/top-topics",
          description: "Get top feedback topics",
          auth: true,
          response: { topTopics: "array" }
        },
        {
          method: "POST",
          path: "/student/feedback",
          description: "Submit feedback",
          auth: true,
          body: { topic: "string", description: "string" },
          response: { message: "string", feedback: "object" }
        },
        {
          method: "GET",
          path: "/api/student/courses",
          description: "Get student courses",
          auth: true,
          response: { enrollments: "array" }
        },
        {
          method: "GET",
          path: "/api/student/attendance",
          description: "Get student attendance",
          auth: true,
          response: { attendance: "array" }
        }
      ]
    },
    {
      category: "Configuration",
      color: "pink",
      routes: [
        {
          method: "GET",
          path: "/api/config",
          description: "Get system configuration",
          auth: true,
          response: { configs: "object", stats: "object" }
        },
        {
          method: "PUT",
          path: "/api/config",
          description: "Update configuration",
          auth: true,
          body: { category: "string", key: "string", value: "string" },
          response: { message: "string" }
        }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: "border-neon-cyan text-neon-cyan",
      pink: "border-neon-pink text-neon-pink",
      green: "border-neon-green text-neon-green",
      blue: "border-neon-blue text-neon-blue",
      purple: "border-neon-purple text-neon-purple"
    };
    return colors[color] || colors.cyan;
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "bg-neon-green/20 text-neon-green border-neon-green",
      POST: "bg-neon-blue/20 text-neon-blue border-neon-blue",
      PUT: "bg-neon-yellow/20 text-neon-yellow border-neon-yellow",
      DELETE: "bg-red-500/20 text-red-400 border-red-500"
    };
    return colors[method] || "bg-gray-500/20 text-gray-400 border-gray-500";
  };

  return (
    <>
      <Head>
        <title>API Documentation - SmartDesk</title>
      </Head>
      <div className="min-h-screen bg-dark relative">
        <nav className="relative z-10 p-6 flex justify-between items-center border-b border-neon-cyan/30">
          <Link href="/" className="text-2xl font-bold neon-glow">SmartDesk</Link>
          <Link href="/" className="btn-neon text-sm px-4 py-2">Back to Home</Link>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient-neon mb-4">API Documentation</h1>
            <p className="text-gray-400">
              Complete API reference for SmartDesk. All endpoints require authentication via HTTP-only cookies 
              unless otherwise specified. Base URL: <code className="text-neon-cyan">{API_BASE}</code>
            </p>
          </div>

          <div className="futuristic-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-neon-cyan mb-4">Authentication</h2>
            <p className="text-gray-300 mb-4">
              Most endpoints require authentication. Include credentials in your requests:
            </p>
            <div className="bg-bg-darker p-4 rounded border border-neon-cyan/20">
              <code className="text-neon-green text-sm">
                fetch('{API_BASE}/api/users', {'{'}
                <br />
                &nbsp;&nbsp;credentials: 'include',
                <br />
                &nbsp;&nbsp;headers: {'{'} 'Content-Type': 'application/json' {'}'}
                <br />
                {'}'})
              </code>
            </div>
          </div>

          {endpoints.map((category, catIdx) => (
            <div key={catIdx} className="mb-8">
              <h2 className={`text-2xl font-bold mb-4 ${getColorClasses(category.color)}`}>
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.routes.map((route, routeIdx) => (
                  <div
                    key={routeIdx}
                    className="futuristic-card p-6 cursor-pointer hover:border-neon-cyan/50 transition-all"
                    onClick={() => setSelectedEndpoint(selectedEndpoint === `${catIdx}-${routeIdx}` ? null : `${catIdx}-${routeIdx}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded text-xs font-bold border ${getMethodColor(route.method)}`}>
                          {route.method}
                        </span>
                        <code className="text-neon-cyan font-mono">{route.path}</code>
                        {route.auth && (
                          <span className="px-2 py-1 bg-neon-pink/20 text-neon-pink text-xs rounded border border-neon-pink/50">
                            Auth Required
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{route.description}</p>

                    {selectedEndpoint === `${catIdx}-${routeIdx}` && (
                      <div className="mt-4 pt-4 border-t border-neon-cyan/20 space-y-4">
                        {route.query && (
                          <div>
                            <h4 className="text-sm font-semibold text-neon-pink mb-2">Query Parameters</h4>
                            <div className="bg-bg-darker p-3 rounded text-sm">
                              <pre className="text-gray-300">{JSON.stringify(route.query, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                        {route.body && (
                          <div>
                            <h4 className="text-sm font-semibold text-neon-pink mb-2">Request Body</h4>
                            <div className="bg-bg-darker p-3 rounded text-sm">
                              <pre className="text-gray-300">{JSON.stringify(route.body, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                        {route.response && (
                          <div>
                            <h4 className="text-sm font-semibold text-neon-green mb-2">Response</h4>
                            <div className="bg-bg-darker p-3 rounded text-sm">
                              <pre className="text-gray-300">{JSON.stringify(route.response, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                        <div className="bg-bg-darker p-3 rounded text-sm">
                          <h4 className="text-sm font-semibold text-neon-cyan mb-2">Example Request</h4>
                          <code className="text-neon-green text-xs">
                            {route.method === "GET" ? (
                              <>
                                fetch('{API_BASE}{route.path}', {'{'}
                                <br />
                                &nbsp;&nbsp;credentials: 'include'
                                <br />
                                {'}'})
                              </>
                            ) : (
                              <>
                                fetch('{API_BASE}{route.path}', {'{'}
                                <br />
                                &nbsp;&nbsp;method: '{route.method}',
                                <br />
                                &nbsp;&nbsp;headers: {'{'} 'Content-Type': 'application/json' {'}'},
                                <br />
                                &nbsp;&nbsp;credentials: 'include',
                                <br />
                                &nbsp;&nbsp;body: JSON.stringify({'{'} ... {'}'})
                                <br />
                                {'}'})
                              </>
                            )}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="futuristic-card p-6 mt-8">
            <h2 className="text-2xl font-bold text-neon-cyan mb-4">Error Responses</h2>
            <p className="text-gray-300 mb-4">All errors follow this format:</p>
            <div className="bg-bg-darker p-4 rounded border border-red-500/20">
              <pre className="text-red-400 text-sm">
                {'{'}
                <br />
                &nbsp;&nbsp;"error": "Error message",
                <br />
                &nbsp;&nbsp;"status": 400
                <br />
                {'}'}
              </pre>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-400">
              <p><strong>400</strong> - Bad Request</p>
              <p><strong>401</strong> - Unauthorized</p>
              <p><strong>403</strong> - Forbidden</p>
              <p><strong>404</strong> - Not Found</p>
              <p><strong>500</strong> - Internal Server Error</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
