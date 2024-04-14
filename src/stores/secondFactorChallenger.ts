// In-House Modules
import type Cumulonimbus from 'cumulonimbus-wrapper';
import { waitUntil } from '@/utils/wait';

// Other Store Modules
import { userStore } from './user';
import { toastStore } from './toast';

// External Modules
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

export const secondFactorChallengerStore = defineStore(
  'second-factor-challenger',
  () => {
    const isChallenging = ref(false),
      user = userStore(),
      toast = toastStore(),
      challenge = ref<Cumulonimbus.SecondFactorChallengeRequiredError | null>(
        null,
      ),
      selectedMethod = ref<'totp' | 'webauthn' | 'backup' | null>(null),
      challengeResponse = ref<Cumulonimbus.SecondFactorResponse | null>();

    const availableMethods = computed<('totp' | 'webauthn' | 'backup')[]>(
        () => challenge.value?.types ?? [],
      ),
      webauthnChallenge =
        computed<PublicKeyCredentialRequestOptionsJSON | null>(
          () => challenge.value?.challenge ?? null,
        );

    function startChallenge(
      challengeError: Cumulonimbus.SecondFactorChallengeRequiredError,
    ): Promise<Cumulonimbus.SecondFactorResponse> {
      if (isChallenging.value) {
        throw new Error("We're already challenging a second factor!");
      }
      return new Promise((res) => {
        // Setup the challenge
        challenge.value = challengeError;
        selectedMethod.value = availableMethods.value[0];
        challengeResponse.value = undefined;
        isChallenging.value = true;

        // Wait for the user to respond
        waitUntil(challengeResponse, (response) => response !== undefined).then(
          () => {
            res(challengeResponse.value as Cumulonimbus.SecondFactorResponse);
            isChallenging.value = false;
            selectedMethod.value = null;
            challenge.value = null;
          },
        );
      });
    }

    function completeChallenge(
      response: string | AuthenticationResponseJSON,
    ): void {
      challengeResponse.value = {
        type: selectedMethod.value!,
        ...{
          code: typeof response === 'string' ? response : undefined,
          response: typeof response === 'object' ? response : undefined,
        },
        token: challenge.value!.token,
      } as Cumulonimbus.SecondFactorResponse;
      isChallenging.value = false;
    }

    function cancelChallenge(): void {
      challengeResponse.value = null;
      isChallenging.value = false;
    }

    return {
      isChallenging,
      selectedMethod,
      availableMethods,
      webauthnChallenge,
      startChallenge,
      completeChallenge,
      cancelChallenge,
    };
  },
);
