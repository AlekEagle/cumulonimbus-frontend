<template>
  <header class="header">
    <router-link to="/">
      <div class="nav-logo">
        <img src="/assets/images/Cumulonimbus.svg" />
        <p>Cumulonimbus</p>
      </div>
    </router-link>
    <ThemeToggle />
    <nav class="navbar">
      <ul ref="navMenu" class="nav-menu">
        <li class="nav-item" @click="mobileMenu">
          <router-link to="/">Home</router-link>
        </li>
        <li class="nav-item" @click="mobileMenu">
          <router-link to="/dashboard/">Dashboard</router-link>
        </li>
        <li class="nav-item" @click="mobileMenu">
          <a href="https://docs.alekeagle.me" target="_blank">Documentation</a>
        </li>
      </ul>
      <div ref="hamburger" class="hamburger" @click="mobileMenu"
        ><span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </nav>
  </header>
  <div class="content">
    <router-view />
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import ThemeToggle from '@/components/ThemeToggle.vue';

  @Options({
    components: {
      ThemeToggle
    }
  })
  export default class Home extends Vue {
    declare $refs: {
      navMenu: HTMLUListElement;
      hamburger: HTMLDivElement;
    };
    mobileMenu() {
      this.$refs.navMenu.classList.toggle('active');
      this.$refs.hamburger.classList.toggle('active');
    }
  }
</script>

<style>
  body {
    margin: 0;
    transition: background-color 0.25s, color 0.25s;
  }

  html.dark-theme body {
    background-color: #212121;
    color: white;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;

    transition: background-color 0.25s, color 0.25s;
  }

  li {
    list-style: none;
  }

  .header {
    display: flex;
    width: calc(100vw - 10px);
    justify-content: space-between;
    margin: 10px 10px 0;
    align-items: center;
  }

  .nav-links {
    margin-right: 15px;
    float: right;
  }

  .hamburger {
    display: none;
  }

  .nav-menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: fit-content;
    padding: 0;
    margin: 0;
  }

  .bar {
    display: block;
    width: 25px;
    height: 3px;
    margin: 5px auto;
    -webkit-transition: all 0.4s ease-in-out;
    transition: all 0.4s ease-in-out;
    background-color: #101010;
  }

  html.dark-theme .bar {
    background-color: white;
  }

  a {
    text-decoration: none;
  }

  .dark-mode-widget {
    margin-left: auto;
  }

  h5,
  h6,
  p {
    font-size: 20px;
    color: black;
    font-family: 'Ubuntu', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  html.dark-theme h5,
  html.dark-theme h6,
  html.dark-theme p {
    color: white;
  }

  .nav-item a {
    height: fit-content;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    margin: 0 5px;
    font-size: 19px;
    font-weight: 600;
    color: #000000;
    border-bottom: transparent solid 2px;
    transition: border 0.25s, color 0.25s;
  }

  html.dark-theme .nav-item a {
    color: white;
    border-bottom: transparent solid 2px;
  }

  .nav-item a.router-link-active {
    border-bottom: #000000 solid 2px;
  }

  html.dark-theme .nav-item a.router-link-active {
    border-bottom: #ffffff solid 2px;
  }

  .nav-logo {
    display: flex;
    align-items: center;
  }

  .nav-logo p {
    height: fit-content;
    margin: 0 0 0 10px;
    padding: 0;
    font-family: 'Montserrat', 'Franklin Gothic Medium', 'Arial Narrow', Arial,
      sans-serif;
    font-weight: 600;
    font-size: 28px;
    color: black;
  }

  html.dark-theme .nav-logo p {
    color: white;
  }

  .nav-logo img {
    height: 50px;
    border-radius: 50%;
  }

  .content {
    text-align: center;
  }

  @media only screen and (max-width: 768px) {
    .nav-menu {
      padding: 10px 0;
      position: fixed;
      left: -100%;
      top: 5rem;
      flex-direction: column;
      background-color: rgba(255, 255, 255, 0.75);
      margin: 0 30px;
      width: calc(100% - (30px * 2));
      border-radius: 10px;
      text-align: center;
      transition: 0.4s;
      box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
    }

    html.dark-theme .nav-menu {
      background-color: rgba(0, 0, 0, 0.75);
    }

    .nav-menu.active {
      left: 0;
    }

    .hamburger {
      display: block;
      cursor: pointer;
      margin-right: 10px;
    }

    .hamburger.active .bar:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active .bar:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }

    .hamburger.active .bar:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }

    .nav-item a {
      font-size: 36px;
      margin: 10px 0;
    }
  }
</style>
