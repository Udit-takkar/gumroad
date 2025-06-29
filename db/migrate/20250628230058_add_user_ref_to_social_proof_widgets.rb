class AddUserRefToSocialProofWidgets < ActiveRecord::Migration[7.1]
  def change
    add_reference :social_proof_widgets, :user, null: false, foreign_key: true
  end
end
