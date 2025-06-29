# frozen_string_literal: true

class SocialProofWidget < ApplicationRecord
  has_paper_trail

  belongs_to :user

  # Association with links/products
  has_and_belongs_to_many :links

  # Alias title_text to the `title` attribute to match the controller's transformation.
  alias_attribute :title_text, :title

  validates :name, presence: true
  validates :title, presence: true
  validates :cta_type, inclusion: { in: %w[button link none],
                                    message: "%{value} is not a valid CTA type" }
  validates :image_type, inclusion: {
    in: %w[
      product_thumbnail
      custom_image
      icon
      none
    ],
    message: "%{value} is not a valid image type"
  }
  validates :icon_name, inclusion: {
    in: %w[
      solid_fire
      solid_heart
      patch_check_fill
      cart3-fill
      solid-users
      star-fill
      solid-sparkles
      clock_fill
      solid_gift
      solid_lightning_bolt
    ],
    message: "%{value} is not a valid icon name"
  }, if: -> { image_type == 'icon' }

  def display_template
    "#{title} - #{description} - CTA: #{cta_text}"
  end
end
