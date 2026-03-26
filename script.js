// Supabase client
const db = supabase.createClient(
  "https://zosvpxwhvumlthebbxfc.supabase.co",
  "sb_publishable_9vRHcUQf-hwXuWEU7NyRgA_-Upmoj7Q"
);

let chart;

// Prevent multiple votes
function vote(pet) {
  if (localStorage.getItem("voted") === "yes") {
    alert("You already voted.");
    return;
  }

  db.from("pet_votes")
    .insert([{ pet }])
    .then(() => {
      localStorage.setItem("voted", "yes");
      loadVotes();
    });
}

// Load votes
async function loadVotes() {
  const { data, error } = await db.from("pet_votes").select("*");

  if (error) {
    console.error(error);
    return;
  }

  const dog = data.filter(v => v.pet === "dog").length;
  const cat = data.filter(v => v.pet === "cat").length;
  const other = data.filter(v => v.pet === "other").length;

  renderChart(dog, cat, other);
}

// Render chart
function renderChart(dog, cat, other) {
  const ctx = document.getElementById("voteChart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Dog", "Cat", "Other"],
      datasets: [
        {
          label: "Votes",
          data: [dog, cat, other],
          backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// Realtime updates
db.channel("realtime:pet_votes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "pet_votes" },
    loadVotes
  )
  .subscribe();

// Initial load
loadVotes();
