import { useState } from "react";
import "../App.css";

function ProfileAnalyzer() {
  const [profileText, setProfileText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeProfile = async () => {
  if (!profileText.trim()) {
    setError("Please enter your profile.");
    return;
  }

  setLoading(true);
  setError("");
  setResult(null);

  try {
    const token = localStorage.getItem("gigora_access_token");

    const response = await fetch(
      "http://127.0.0.1:8000/api/profile/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile_text: profileText,
        }),
      }
    );


    const data = await response.json();


    console.log("API Response:", data);


    if (!response.ok) {
      throw new Error(
        data.detail || "Something went wrong."
      );
    }


    let formattedResult = data;


    // FastAPI response:
    // {
    //   success:true,
    //   data:{
    //      score,
    //      strengths,
    //      weaknesses,
    //      suggestions
    //   }
    // }

    if (data.data) {
      formattedResult = data.data;
    }


    // If AI response is string JSON

    if (typeof formattedResult === "string") {

      formattedResult = JSON.parse(
        formattedResult
      );

    }


    // If Gemini returns:
    // { result:"json string" }

    if (
      formattedResult.result &&
      typeof formattedResult.result === "string"
    ) {

      formattedResult = JSON.parse(
        formattedResult.result
      );

    }


    console.log(
      "Final Profile Result:",
      formattedResult
    );


    setResult(formattedResult);


    window.dispatchEvent(
      new Event("dashboard-update")
    );


  } catch (err) {

    console.error("Profile Error:", err);
    setError(err.message);

  }


  setLoading(false);
};


  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">

      <div className="mx-auto max-w-5xl">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-[#1E3A5F]">
            AI Profile Analyzer
          </h1>

          <p className="mt-3 text-lg text-[#6B7280]">
            Analyze your Fiverr or Upwork profile and receive
            AI-powered recommendations.
          </p>

        </div>


        <div className="rounded-3xl bg-white p-8 shadow-lg">


          <label className="mb-3 block text-sm font-semibold text-[#1E3A5F]">
            Profile Description
          </label>


          <textarea

            placeholder="Paste your Fiverr or Upwork profile here..."

            value={profileText}

            onChange={(e)=>setProfileText(e.target.value)}

            className="min-h-[220px] w-full rounded-2xl border border-gray-300 px-5 py-4 text-[#111827] outline-none focus:border-[#1A56DB]"
          />


          <button

            onClick={analyzeProfile}

            disabled={loading}

            className="mt-8 rounded-xl bg-[#1A56DB] px-8 py-4 font-semibold text-white hover:bg-[#1E3A5F]"
          >

            {loading ? "Analyzing..." : "Analyze Profile"}

          </button>



          {
            error && (

              <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">

                {error}

              </div>

            )
          }



          {
            result && (

              <div className="mt-10 space-y-8">


                {/* Score */}

                <div className="rounded-3xl bg-gradient-to-r from-[#1A56DB] to-[#1E3A5F] p-8 text-center text-white">

                  <p className="text-lg">
                    Overall Profile Score
                  </p>


                  <h2 className="mt-3 text-6xl font-bold">

                    {result.score || 0}/10

                  </h2>


                </div>



                <div className="grid gap-6 lg:grid-cols-3">


                  {/* Strengths */}

                  <div className="rounded-2xl bg-white p-6 shadow">

                    <h3 className="mb-5 text-xl font-bold text-green-600">

                      Strengths

                    </h3>


                    <ul className="space-y-3">

                      {
                        result.strengths?.map(
                          (item,index)=>(

                            <li key={index}>

                              ✓ {item}

                            </li>

                          )
                        )
                      }

                    </ul>

                  </div>





                  {/* Weakness */}

                  <div className="rounded-2xl bg-white p-6 shadow">


                    <h3 className="mb-5 text-xl font-bold text-red-600">

                      Weaknesses

                    </h3>


                    <ul className="space-y-3">


                      {
                        result.weaknesses?.map(
                          (item,index)=>(

                            <li key={index}>

                              ✕ {item}

                            </li>

                          )
                        )
                      }


                    </ul>


                  </div>






                  {/* Suggestions */}

                  <div className="rounded-2xl bg-white p-6 shadow">


                    <h3 className="mb-5 text-xl font-bold text-blue-600">

                      Suggestions

                    </h3>


                    <ul className="space-y-3">


                      {
                        result.suggestions?.map(
                          (item,index)=>(

                            <li key={index}>

                              → {item}

                            </li>

                          )
                        )
                      }


                    </ul>


                  </div>


                </div>


              </div>

            )
          }


        </div>


      </div>


    </div>
  );
}


export default ProfileAnalyzer;