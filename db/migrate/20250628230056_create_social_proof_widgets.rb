class CreateSocialProofWidgets < ActiveRecord::Migration[7.1]
  def change
    create_table :social_proof_widgets do |t|
      t.string :name
      t.boolean :universal
      t.string :title
      t.text :description
      t.string :cta_text
      t.string :cta_type
      t.string :image_type
      t.string :image_url
      t.string :icon_name

      t.timestamps
    end
  end
end
