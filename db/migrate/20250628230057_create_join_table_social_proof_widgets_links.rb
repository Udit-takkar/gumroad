class CreateJoinTableSocialProofWidgetsLinks < ActiveRecord::Migration[7.1]
  def change
    create_join_table :social_proof_widgets, :links do |t|
      # t.index [:social_proof_widget_id, :link_id]
      # t.index [:link_id, :social_proof_widget_id]
    end
  end
end
