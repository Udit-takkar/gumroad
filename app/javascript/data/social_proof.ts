import { request } from "$app/utils/request";

type SocialProofPlayload = {
  name: string;
  titleText: string;
  description: string;
  ctaText: string;
  ctaType: { id: "button" | "link" | "none"; label: string };
  image: { id: "product" | "custom" | "icon" | "none"; label: string };
  icon: string;
  iconColor: string;
  selectedProductIds: string[];
  universal: boolean;
};

export const createSocialProof = async (payload: SocialProofPlayload) => {
  const response = await request({
    method: "POST",
    accept: "json",
    url: Routes.checkout_social_path(),
    data: payload,
  });

  return response;
};
