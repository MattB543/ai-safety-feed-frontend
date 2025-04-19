<template>
  <header class="bg-white shadow-sm py-4 px-4">
    <div
      class="w-full max-w-[980px] mx-auto flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center"
    >
      <h1 class="text-2xl font-bold text-gray-800">AI Safety Feed</h1>
      <div
        class="flex items-center gap-2 md:gap-3 flex-wrap w-full justify-start md:w-auto md:justify-end"
      >
        <!-- Submit Content Button -->
        <a
          href="https://forms.gle/Kgy2xe6m7Y32nqKv7"
          target="_blank"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 gap-1"
          aria-label="Submit Content"
          title="Submit Content"
        >
          <CirclePlus class="h-4 w-4" stroke-width="2" />
          Submit Content
        </a>
        <!-- Feedback Button -->
        <a
          href="https://forms.gle/rZodzMMSFh2sFMXZA"
          target="_blank"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 gap-1"
          aria-label="Provide Feedback"
          title="Provide Feedback"
        >
          Feedback
        </a>

        <!-- CSV download button -->
        <a
          :href="`${API_BASE_URL}/api/content/export`"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          aria-label="Download full CSV"
          title="Download full CSV"
        >
          <Download class="h-4 w-4" stroke-width="2" />
        </a>

        <!-- Discord Icon -->
        <a
          href="https://discord.gg/kq3Uux8yDN"
          target="_blank"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          aria-label="Join Discord"
          title="Join Discord"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 640 512"
            class="w-4 h-4"
          >
            <path
              d="M524.531 69.836a1.5 1.5 0 0 0-.764-.7A485.065 485.065 0 0 0 404.081 32.03a1.816 1.816 0 0 0-1.923.91a337.461 337.461 0 0 0-14.9 30.6a447.848 447.848 0 0 0-134.426 0a309.541 309.541 0 0 0-15.135-30.6a1.89 1.89 0 0 0-1.924-.91a483.689 483.689 0 0 0-119.688 37.107a1.712 1.712 0 0 0-.788.676C39.068 183.651 18.186 294.69 28.43 404.354a2.016 2.016 0 0 0 .765 1.375a487.666 487.666 0 0 0 146.825 74.189a1.9 1.9 0 0 0 2.063-.676A348.2 348.2 0 0 0 208.12 430.4a1.86 1.86 0 0 0-1.019-2.588a321.173 321.173 0 0 1-45.868-21.853a1.885 1.885 0 0 1-.185-3.126a251.047 251.047 0 0 0 9.109-7.137a1.819 1.819 0 0 1 1.9-.256c96.229 43.917 200.41 43.917 295.5 0a1.812 1.812 0 0 1 1.924.233a234.533 234.533 0 0 0 9.132 7.16a1.884 1.884 0 0 1-.162 3.126a301.407 301.407 0 0 1-45.89 21.83a1.875 1.875 0 0 0-1 2.611a391.055 391.055 0 0 0 30.014 48.815a1.864 1.864 0 0 0 2.063.7A486.048 486.048 0 0 0 610.7 405.729a1.882 1.882 0 0 0 .765-1.352c12.264-126.783-20.532-236.912-86.934-334.541zM222.491 337.58c-28.972 0-52.844-26.587-52.844-59.239s23.409-59.241 52.844-59.241c29.665 0 53.306 26.82 52.843 59.239c0 32.654-23.41 59.241-52.843 59.241zm195.38 0c-28.971 0-52.843-26.587-52.843-59.239s23.409-59.241 52.843-59.241c29.667 0 53.307 26.82 52.844 59.239c0 32.654-23.177 59.241-52.844 59.241z"
              fill="currentColor"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Download, CirclePlus } from "@vicons/tabler";

// Define props to accept API_BASE_URL
const props = defineProps({
  API_BASE_URL: {
    type: String,
    required: true,
  },
});
</script>
