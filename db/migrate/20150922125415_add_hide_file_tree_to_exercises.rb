class AddHideFileTreeToExercises < ActiveRecord::Migration
  def change
    add_column :exercises, :hide_file_tree, :boolean
  end
end
