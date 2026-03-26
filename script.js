const SUPABASE_URL = "https://zosvpxwhvumlthebbxfc.supabase.co";
const SUPABASE_KEY = "sb_publishable_9vRHcUQf-hwXuWEU7NyRgA_-Upmoj7Q";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function vote(pet) {
  await db.from("pet_votes").insert([{ pet }]);
}

// Load initial votes
async function loadVotes() {
  const { data } = await db.from("pet_votes").select("*");

  const dog = data.filter(v => v.pet === "dog").length;
  const cat = data.filter(v => v.pet === "cat").length;
  const other = data.filter(v => v.pet === "other").length;

  // Update text counts
  document.getElementById("dogCount").textContent = dog;
  document.getElementById("catCount").textContent = cat;
  document.getElementById("otherCount").textContent = other;

  // Percentages
  const total = dog + cat + other;
  const dogPct = total ? (dog / total) * 100 : 0;
  const catPct = total ? (cat / total) * 100 : 0;
  const otherPct = total ? (other / total) * 100 : 0;

  // Update bar widths
  document.querySelector(".dogBar").style.width = dogPct + "%";
  document.querySelector(".catBar").style.width = catPct + "%";
  document.querySelector(".otherBar").style.width = otherPct + "%";
}

// Real-time listener
db.channel("pet-votes-channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "pet_votes" },
    () => {
      loadVotes(); // refresh graph instantly
    }
  )
  .subscribe();

// Initial load
loadVotes();
