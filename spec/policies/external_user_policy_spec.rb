require 'rails_helper'

describe ExternalUserPolicy do
  subject { described_class }

  [:create?, :destroy?, :edit?, :new?, :show?, :update?].each do |action|
    permissions(action) do
      it 'grants access to admins only' do
        expect(subject).to permit(FactoryBot.build(:admin), ExternalUser.new)
        [:external_user, :teacher].each do |factory_name|
          expect(subject).not_to permit(FactoryBot.build(factory_name), ExternalUser.new)
        end
      end
    end
  end

  [:index?].each do |action|
    permissions(action) do
      it 'grants access to admins and teachers only' do
        expect(subject).to permit(FactoryBot.build(:admin), ExternalUser.new)
        expect(subject).to permit(FactoryBot.build(:teacher), ExternalUser.new)
        [:external_user].each do |factory_name|
          expect(subject).not_to permit(FactoryBot.build(factory_name), ExternalUser.new)
        end
      end
    end
  end
end
