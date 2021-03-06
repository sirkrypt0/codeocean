require 'rails_helper'

describe CodeharborLinksController do
  let(:user) { FactoryBot.create(:teacher) }
  before(:each) { allow(controller).to receive(:current_user).and_return(user) }

  describe 'GET #new' do
    before { get :new }

    expect_status(200)
  end

  describe 'GET #edit' do
    let(:codeharbor_link) { FactoryBot.create(:codeharbor_link, user: user) }

    before { get :edit, params: { id: codeharbor_link.id } }

    expect_status(200)
  end

  describe 'POST #create' do
    let(:post_request) { post :create, params: {codeharbor_link: params} }
    let(:params) { {push_url: 'http://foo.bar/push', check_uuid_url: 'http://foo.bar/check', api_key: 'api_key'} }

    it 'creates a codeharbor_link' do
      expect { post_request }.to change(CodeharborLink, :count).by(1)
    end

    it 'redirects to user show' do
      expect(post_request).to redirect_to(user)
    end

    context 'with invalid params' do
      let(:params) { {push_url: '', check_uuid_url: '', api_key: ''} }

      it 'does not create a codeharbor_link' do
        expect { post_request }.not_to change(CodeharborLink, :count)
      end

      it 'redirects to user show' do
        post_request
        expect(response).to render_template(:new)
      end
    end
  end

  describe 'PUT #update' do
    let(:codeharbor_link) { FactoryBot.create(:codeharbor_link, user: user) }
    let(:put_request) { patch :update, params: {id: codeharbor_link.id, codeharbor_link: params} }
    let(:params) { {push_url: 'http://foo.bar/push', check_uuid_url: 'http://foo.bar/check', api_key: 'api_key'} }

    it 'updates push_url' do
      expect { put_request }.to change { codeharbor_link.reload.push_url }.to('http://foo.bar/push')
    end
    it 'updates check_uuid_url' do
      expect { put_request }.to change { codeharbor_link.reload.check_uuid_url }.to('http://foo.bar/check')
    end
    it 'updates api_key' do
      expect { put_request }.to change { codeharbor_link.reload.api_key }.to('api_key')
    end

    it 'redirects to user show' do
      expect(put_request).to redirect_to(user)
    end

    context 'with invalid params' do
      let(:params) { {push_url: '', check_uuid_url: '', api_key: ''} }

      it 'does not change codeharbor_link' do
        expect { put_request }.not_to change { codeharbor_link.reload.attributes }
      end

      it 'redirects to user show' do
        put_request
        expect(response).to render_template(:edit)
      end
    end
  end

  describe 'DELETE #destroy' do
    let!(:codeharbor_link) { FactoryBot.create(:codeharbor_link, user: user) }
    let(:destroy_request) { delete :destroy, params: {id: codeharbor_link.id} }

    it 'deletes codeharbor_link' do
      expect { destroy_request }.to change(CodeharborLink, :count).by(-1)
    end

    it 'redirects to user show' do
      expect(destroy_request).to redirect_to(user)
    end
  end
end

