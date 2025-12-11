"use client";

import { useState } from "react";
import { FiZap, FiCheck, FiCopy } from "react-icons/fi";
import { IoCodeSharp } from "react-icons/io5";
import { AiOutlineBarChart } from "react-icons/ai";
import { FiBook, FiSettings } from "react-icons/fi";
import DocumentationSidebar from "@/components/DocumentationSidebar";

interface CodeBlockProps {
  code: string;
  language: string;
  id: string;
}

export default function Documentation() {
  const [copiedCode, setCopiedCode] = useState<string>("");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const installCode = `<script
  src="https://tourify-widget.vercel.app/tourify-widget.js"
  data-tour-id="your-tour-id"
  data-auto-start="true"
  data-show-avatar="true"
  data-theme="light">
</script>`;

  const basicUsage = `<script
  src="https://tourify-widget.vercel.app/tourify-widget.js"
  data-tour-id="your-tour-id">
</script>`;

  const advancedConfig = `<script
  src="https://tourify-widget.vercel.app/tourify-widget.js"
  data-tour-id="tour_123"
  data-auto-start="false"
  data-show-avatar="false"
  data-theme="dark"
  data-api-url="https://your-custom-api.com">
</script>`;

  const customSteps = `// Tourify automatically uses built-in mock tours for IDs like:
// - 'tourify-default-1' (Basic Welcome Tour)
// - 'tourify-default-2' (E-Commerce Dashboard Tour)

// For custom tours, your server should return data in this format:
const tourData = {
  id: 'custom_tour',
  name: 'My Custom Tour',
  steps: [
    {
      id: 'step_1',
      title: 'Welcome!',
      description: 'Tour description here',
      target: '#element-id',      // CSS selector or 'body'
      position: 'bottom'          // 'top', 'bottom', 'left', 'right', 'center'
    }
    // ... more steps
  ]
};`;

  const apiExample = `const response = await fetch('/api/tours', {
method: 'POST',
headers: {
  'Content-Type': 'application/json',
  Authorization: 'Bearer your_api_key'
},
body: JSON.stringify({
  name: 'Welcome Tour',
  description: 'Onboard new users',
  steps: [...]
})
});`;

  const CodeBlock = ({ code, language, id }: CodeBlockProps) => (
    <div className="relative bg-slate-900 rounded-lg p-6 mb-6">
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
      >
        {copiedCode === id ? (
          <FiCheck className="w-5 h-5 text-green-400" />
        ) : (
          <FiCopy className="w-5 h-5 text-gray-400 transition duration-300 cursor-pointer" />
        )}
      </button>

      <pre className="text-sm text-gray-300 overflow-x-auto pr-12">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="lg:block hidden">
          <DocumentationSidebar />
        </div>
        <main className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Documentation
            </h1>
            <p className="text-lg text-slate-600">
              Everything you need to integrate Tourify into your website
            </p>
          </div>

          <section
            id="getting-started"
            className="bg-white rounded-xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiZap className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Getting Started
              </h2>
            </div>

            <p className="text-slate-600 mb-6">
              Tourify is a lightweight onboarding widget for product tours. Get
              started in just 3 steps:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Create Tour
                </h3>
                <p className="text-sm text-slate-600">
                  Sign up and create your first tour in the dashboard
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Install Widget
                </h3>
                <p className="text-sm text-slate-600">
                  Add our script to your website's HTML
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Launch</h3>
                <p className="text-sm text-slate-600">
                  Your tour is live! Track analytics in real-time
                </p>
              </div>
            </div>
          </section>

          {/* Installation */}
          <section
            id="installation"
            className="bg-white rounded-xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <IoCodeSharp className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Installation
              </h2>
            </div>

            <p className="text-slate-600 mb-4">
              Add these lines to your HTML ( first two attributes, "src" and "data-tour-id" are required ), right before the closing{" "}
              <code className="bg-slate-100 px-2 py-1 rounded">
                &lt;/body&gt;
              </code>{" "}
              tag:
            </p>

            <CodeBlock code={installCode} language="html" id="install" />
          </section>

          {/* Basic Usage */}
          <section
            id="basic-usage"
            className="bg-white rounded-xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiBook className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Basic Usage</h2>
            </div>

            <p className="text-slate-600 mb-4">
              Initialize the widget with your tour ID:
            </p>

            <CodeBlock code={basicUsage} language="javascript" id="basic" />

            <p className="text-slate-600 mb-4">
              You can find your tour ID in the dashboard after
              creating a tour.
            </p>
          </section>

          {/* Configuration */}
          <section
            id="configuration"
            className="bg-white rounded-xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiSettings className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Configuration Options
              </h2>
            </div>

            <p className="text-slate-600 mb-4">
              Customize the widget behavior with these options:
            </p>

            <CodeBlock
              code={advancedConfig}
              language="javascript"
              id="advanced"
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Option
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        tourId
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-600">string</td>
                    <td className="py-3 px-4 text-slate-600">
                      Your tour ID (required)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        apiKey
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-600">string</td>
                    <td className="py-3 px-4 text-slate-600">
                      Your API key (required)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        autoStart
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-600">boolean</td>
                    <td className="py-3 px-4 text-slate-600">
                      Start tour automatically (default: false)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        theme
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-600">string</td>
                    <td className="py-3 px-4 text-slate-600">
                      'light' or 'dark'
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Custom Tours */}
          <section
            id="custom-tours"
            className="bg-white rounded-xl border border-slate-200 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Creating Custom Tours
            </h2>

            <p className="text-slate-600 mb-4">
              You can define custom tour steps programmatically:
            </p>

            <CodeBlock code={customSteps} language="javascript" id="custom" />

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-3">
                Step Properties
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <code className="bg-slate-100 px-2 py-1 rounded">id</code> -
                  Unique identifier for the step
                </li>
                <li>
                  <code className="bg-slate-100 px-2 py-1 rounded">title</code>{" "}
                  - Step title shown in tooltip
                </li>
                <li>
                  <code className="bg-slate-100 px-2 py-1 rounded">
                    description
                  </code>{" "}
                  - Step description
                </li>
                <li>
                  <code className="bg-slate-100 px-2 py-1 rounded">
                    targetSelector
                  </code>{" "}
                  - CSS selector for element to highlight
                </li>
                <li>
                  <code className="bg-slate-100 px-2 py-1 rounded">
                    position
                  </code>{" "}
                  - Tooltip position: 'top', 'bottom', 'left', 'right'
                </li>
              </ul>
            </div>
          </section>

          {/* API Reference */}
          <section
            id="api-reference"
            className="bg-white rounded-xl border border-slate-200 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <AiOutlineBarChart className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                API Reference
              </h2>
            </div>

            <p className="text-slate-600 mb-4">
              Use our REST API to manage tours programmatically:
            </p>

            <CodeBlock code={apiExample} language="javascript" id="api" />

            <div className="space-y-4 mt-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    POST
                  </span>
                  <code className="text-sm">/api/tours</code>
                </div>
                <p className="text-sm text-slate-600">Create a new tour</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    GET
                  </span>
                  <code className="text-sm">/api/tours/:id</code>
                </div>
                <p className="text-sm text-slate-600">Get tour details</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                    PUT
                  </span>
                  <code className="text-sm">/api/tours/:id</code>
                </div>
                <p className="text-sm text-slate-600">Update a tour</p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    DELETE
                  </span>
                  <code className="text-sm">/api/tours/:id</code>
                </div>
                <p className="text-sm text-slate-600">Delete a tour</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
