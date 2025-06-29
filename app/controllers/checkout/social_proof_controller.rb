# frozen_string_literal: true

class Checkout::SocialProofController < Sellers::BaseController
    def show
      authorize [:checkout, :social_proof]

      @title = "Social proof"
      @social_proof_props = Checkout::SocialProofPresenter.new(pundit_user:).social_proof_props
      @body_class = "fixed-aside"
      @products = current_seller.products.order(:name)

      render :index
    end

    def create
      authorize [:checkout, :social_proof]

      permitted_params = social_proof_widget_params
      widget_attributes = {
        name: permitted_params[:name],
        universal: permitted_params[:universal],
        title: permitted_params[:title_text],
        description: permitted_params[:description],
        cta_text: permitted_params[:cta_text],
        cta_type: permitted_params.dig(:cta_type, :id),
        image_type: permitted_params.dig(:image, :id),
        icon_name: permitted_params[:icon]
      }.compact

      social_proof_widget = current_user.social_proof_widgets.new(widget_attributes)

      if social_proof_widget.universal
        social_proof_widget.links = current_user.links.alive
      elsif permitted_params[:selected_product_ids].present?
        found_links = permitted_params[:selected_product_ids].filter_map do |link_id|
          link = Link.find_by_external_id(link_id)
          link if link&.user_id == current_user.id
        end
        social_proof_widget.links = found_links
      end

      if social_proof_widget.save
        render json: {
          success: true,
          social_proof_widgets: [social_proof_widget].map { |widget| presenter.social_proof_widget_props(widget) }
        }
      else
        render json: {
          success: false,
          error_message: social_proof_widget.errors.full_messages.first
        }
      end
    end

    private
      def parse_date_times
        # social_proof_widget_params[:valid_at] = Date.parse(social_proof_widget_params[:valid_at]) if social_proof_widget_params[:valid_at].present?
        # social_proof_widget_params[:expires_at] = Date.parse(social_proof_widget_params[:expires_at]) if social_proof_widget_params[:expires_at].present?
      end

      def social_proof_widget_params
        params
          .permit(
            :name,
            :universal,
            :titleText,
            :description,
            :ctaText,
            :icon,
            { ctaType: [:id, :label] },
            { image: [:id, :label] },
            selectedProductIds: []
          )
          .transform_keys(&:underscore)
      end

      def presenter
        Checkout::SocialProofPresenter.new(pundit_user:)
      end
  end
