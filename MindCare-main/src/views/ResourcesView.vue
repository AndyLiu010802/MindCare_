<template>
  <div class="body">
    <NavbarComponent class="sticky-top" />

    <div class="row">
      <div class="col-md-2 col-sm-6 col-xs-12 menu-container">
        <div class="link-container mt-5 ps-3">
          <a
            @click="selectSection('mental-health')"
            :class="{ active: pageSection === 'mental-health' }"
            >Mental Health</a
          >
          <a @click="selectSection('library')" :class="{ active: pageSection === 'library' }"
            >Library</a
          >
        </div>
        <div class="vertical-line"></div>
      </div>

      <div class="col-md-9 col-sm-6 col-xs-12 mb-4 card-bg">
        <div v-if="pageSection === 'mental-health'" class="row card-grid p-4">
          <div
            v-for="(item, index) in cards"
            :key="index"
            class="col-lg-4 col-md-6 col-sm-12 mb-4 single-card"
          >
            <CardComponent
              :title="item.title"
              :content="item.content"
              :color="item.color"
              :navTitle="item.navTitle"
              @click="navigateToResourceDetails(item.title)"
              :boxShadow="'0 0 10px 0 rgba(0, 0, 0, 0.8)'"
            />
          </div>
        </div>
        <div v-if="pageSection === 'library'" class="p-3">
          <LibraryView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavbarComponent from '@/components/NavbarComponent.vue'
import CardComponent from '@/components/ResourceCard.vue'
import LibraryView from './LibraryView.vue'

const pageSection = ref('mental-health')
const router = useRouter()

const selectSection = (section) => {
  pageSection.value = section
}

const navigateToResourceDetails = (title) => {
  router.push({ name: 'ResourceDetails', params: { title } })
}

const cards = [
  {
    title: 'Addiction',
    content:
      'A chronic condition characterized by the compulsive use of substances or engagement in behaviors despite harmful consequences. It often involves both physical and psychological dependence.',
    color: '#e74c3c',
    navTitle: 'Read More'
  },
  {
    title: 'Anxiety',
    content:
      'A mental health condition marked by excessive worry, fear, or nervousness. It can manifest as a constant state of unease, often without a clear cause, and may interfere with daily life.',
    color: '#3498db',
    navTitle: 'Read More'
  },
  {
    title: 'ADHD',
    content:
      'A neurodevelopmental disorder characterized by persistent patterns of inattention, hyperactivity, and impulsivity that are more severe than typically observed in individuals at a similar level of development.',
    color: '#f39c12',
    navTitle: 'Read More',
    link: '/adhd'
  },
  {
    title: "Asperger's",
    content:
      "A developmental disorder that was previously considered a form of autism spectrum disorder (ASD). Individuals with Asperger's typically have difficulty with social interactions but do not have significant delays in language or cognitive development.",
    color: '#8e44ad',
    navTitle: 'Read More'
  },
  {
    title: 'Autism',
    content:
      'A neurodevelopmental disorder characterized by challenges with social communication and interaction, as well as restricted, repetitive patterns of behavior, interests, or activities.',
    color: '#27ae60',
    navTitle: 'Read More'
  },
  {
    title: 'Bipolar Disorder',
    content:
      'A mental health condition that causes extreme mood swings, including emotional highs (mania or hypomania) and lows (depression). These mood swings can affect sleep, energy, behavior, and the ability to think clearly.',
    color: '#c0392b',
    navTitle: 'Read More'
  },
  {
    title: 'Depression',
    content:
      'A mental health condition characterized by persistent feelings of sadness, hopelessness, and a lack of interest or pleasure in most activities. Depression can also affect sleep, appetite, and energy levels, leading to physical symptoms and difficulty in daily functioning.',
    color: '#34495e',
    navTitle: 'Read More'
  },
  {
    title: 'Obsessive-Compulsive Disorder (OCD)',
    content:
      'A mental health disorder characterized by unwanted, recurring thoughts (obsessions) and/or repetitive behaviors (compulsions). These behaviors are often carried out in an attempt to reduce anxiety associated with the obsessions, but they can interfere significantly with daily life.',
    color: '#9b59b6',
    navTitle: 'Read More'
  },
  {
    title: 'Post-Traumatic Stress Disorder (PTSD)',
    content:
      'A mental health condition that can develop after experiencing or witnessing a traumatic event. Symptoms may include flashbacks, nightmares, severe anxiety, and uncontrollable thoughts about the event, which can affect daily functioning.',
    color: '#1abc9c',
    image: 'https://via.placeholder.com/320x320',
    navTitle: 'Read More'
  },
  {
    title: 'Schizophrenia',
    content:
      'A serious mental disorder in which people interpret reality abnormally. Schizophrenia may result in some combination of hallucinations, delusions, and extremely disordered thinking and behavior that impairs daily functioning.',
    color: '#e67e22',
    navTitle: 'Read More'
  },
  {
    title: 'Panic Disorder',
    content:
      'A type of anxiety disorder characterized by sudden, recurrent panic attacks, which are intense periods of fear or discomfort that may include palpitations, sweating, trembling, shortness of breath, and feelings of impending doom.',
    color: '#ecf0f1',
    navTitle: 'Read More'
  },
  {
    title: 'Borderline Personality Disorder (BPD)',
    content:
      'A mental health disorder characterized by unstable moods, behavior, and relationships. People with BPD may experience intense episodes of anger, depression, and anxiety that may last from a few hours to days, and they often have a distorted self-image and fear of abandonment.',
    color: '#2ecc71',
    navTitle: 'Read More'
  },
  {
    title: 'Social Anxiety Disorder (Social Phobia)',
    content:
      'A chronic mental health condition in which social interactions cause irrational anxiety. People with social anxiety disorder often experience intense fear of being judged, embarrassed, or humiliated in social situations, leading to avoidance of social interactions.',
    color: '#e74c3c',
    navTitle: 'Read More'
  },
  {
    title: 'Eating Disorders',
    content:
      'Mental health disorders characterized by severe disturbances in eating behavior. Anorexia involves an intense fear of gaining weight and a distorted body image, leading to restricted food intake. Bulimia involves binge eating followed by behaviors such as vomiting or excessive exercise to prevent weight gain.',
    color: '#95a5a6',
    navTitle: 'Read More'
  },
  {
    title: 'Generalized Anxiety Disorder (GAD)',
    content:
      'A mental health condition characterized by excessive, uncontrollable worry about various aspects of daily life. This worry is often disproportionate to the situation and may be accompanied by physical symptoms like restlessness, fatigue, and difficulty concentrating.',
    color: '#f1c40f',
    navTitle: 'Read More'
  },
  {
    title: 'Dissociative Identity Disorder (DID)',
    content:
      "A severe form of dissociation, a mental process which produces a lack of connection in a person's thoughts, memory, and sense of identity. DID is characterized by the presence of two or more distinct personality states or identities that control an individual's behavior at different times.",
    color: '#2c3e50',
    navTitle: 'Read More'
  }
]
</script>

<style scoped>
.body {
  height: 100vh;
  background-color: antiquewhite;
  overflow-x: hidden;
}

.menu-container {
  display: flex;
  flex-direction: row;
  height: 70vh;
}

.link-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-style: italic;
  font-size: 1.5rem;
}

.link-container a {
  color: #5e91ce;
  text-decoration: none;
  cursor: pointer;
}

.link-container a.active {
  text-decoration: underline;
}

.vertical-line {
  width: 1px;
  height: 88vh;
  background-color: #5e91ce;
  margin: 0 auto;
}

.card-bg {
  height: 85vh;
  overflow-y: scroll !important;
  scroll-snap-type: proximity;
  scrollbar-width: thin;
  scrollbar-color: #5e91ce #f5f5f5;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 1199.8px) {
  .link-container {
    font-size: 1.2rem;
  }

  .body {
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .card-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .menu-container {
    display: flex;
    height: auto;
    justify-content: space-between;
  }

  .vertical-line {
    display: none;
  }
}
</style>
